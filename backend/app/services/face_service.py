import numpy as np
from PIL import Image
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


def detect_faces_pil(image_path: str) -> list:
    """Simple face region detection using skin color heuristics.
    Returns bounding boxes of likely face regions."""
    try:
        img = Image.open(image_path).convert("RGB")
        rgb = np.array(img)
    except Exception as e:
        logger.error(f"Could not load image: {e}")
        return []

    h, w, _ = rgb.shape
    r, g, b = rgb[:, :, 0].astype(float), rgb[:, :, 1].astype(float), rgb[:, :, 2].astype(float)

    # Skin color detection in RGB space
    skin_mask = (
        (r > 95) & (g > 40) & (b > 20) &
        (r > g) & (r > b) &
        (np.abs(r - g) > 15) &
        (r - np.minimum(g, b) > 15)
    )

    # Find connected regions of skin color
    block_size = 32
    face_candidates = []

    for y in range(0, h - block_size, block_size // 2):
        for x in range(0, w - block_size, block_size // 2):
            block = skin_mask[y:y+block_size, x:x+block_size]
            coverage = float(np.mean(block))
            if coverage > 0.3:
                face_candidates.append({
                    "x": int(x), "y": int(y),
                    "w": block_size, "h": block_size,
                    "coverage": coverage
                })

    if not face_candidates:
        return []

    # Merge overlapping candidates into larger regions
    merged = merge_face_regions(face_candidates)

    # Filter by size - faces should be reasonably sized
    min_face_area = (h * w) * 0.005  # At least 0.5% of image
    max_face_area = (h * w) * 0.5    # At most 50% of image

    results = []
    for region in merged:
        area = region["w"] * region["h"]
        if min_face_area < area < max_face_area:
            # Extract face region
            y1 = max(0, region["y"])
            y2 = min(h, region["y"] + region["h"])
            x1 = max(0, region["x"])
            x2 = min(w, region["x"] + region["w"])

            face_img = img.crop((x1, y1, x2, y2))
            face_gray = face_img.convert("L").resize((100, 100))
            face_data = np.array(face_gray, dtype=np.float64)

            results.append({
                "x": region["x"], "y": region["y"],
                "w": region["w"], "h": region["h"],
                "face_data": face_data,
            })

    # If no proper face found but candidates exist, use the largest one
    if not results and face_candidates:
        best = max(face_candidates, key=lambda c: c["coverage"] * c["w"] * c["h"])
        y1 = max(0, best["y"])
        y2 = min(h, best["y"] + best["h"])
        x1 = max(0, best["x"])
        x2 = min(w, best["x"] + best["w"])

        face_img = img.crop((x1, y1, x2, y2))
        face_gray = face_img.convert("L").resize((100, 100))
        face_data = np.array(face_gray, dtype=np.float64)

        results.append({
            "x": best["x"], "y": best["y"],
            "w": best["w"], "h": best["h"],
            "face_data": face_data,
        })

    return results


def merge_face_regions(candidates):
    """Merge nearby face color regions into larger bounding boxes."""
    if not candidates:
        return []

    merged = []
    used = set()

    for i, c1 in enumerate(candidates):
        if i in used:
            continue
        group = [c1]
        for j, c2 in enumerate(candidates):
            if j <= i or j in used:
                continue
            # Check if regions are close
            if (abs(c1["x"] - c2["x"]) < c1["w"] * 1.5 and
                abs(c1["y"] - c2["y"]) < c1["h"] * 1.5):
                group.append(c2)
                used.add(j)

        x_min = min(g["x"] for g in group)
        y_min = min(g["y"] for g in group)
        x_max = max(g["x"] + g["w"] for g in group)
        y_max = max(g["y"] + g["h"] for g in group)

        merged.append({
            "x": x_min, "y": y_min,
            "w": x_max - x_min, "h": y_max - y_min,
            "coverage": max(g["coverage"] for g in group),
        })
        used.add(i)

    return merged


def compute_face_similarity(face1_data: np.ndarray, face2_data: np.ndarray) -> float:
    """Compute similarity between two face images using histogram and structural analysis."""
    if face1_data is None or face2_data is None:
        return 0.0

    face1 = np.array(Image.fromarray(face1_data.astype(np.uint8)).resize((100, 100)), dtype=np.float64)
    face2 = np.array(Image.fromarray(face2_data.astype(np.uint8)).resize((100, 100)), dtype=np.float64)

    # Histogram comparison using correlation
    hist1, _ = np.histogram(face1.ravel(), bins=256, range=(0, 256))
    hist2, _ = np.histogram(face2.ravel(), bins=256, range=(0, 256))

    hist1 = hist1.astype(np.float64)
    hist2 = hist2.astype(np.float64)

    # Normalize
    hist1 /= hist1.sum() + 1e-10
    hist2 /= hist2.sum() + 1e-10

    # Correlation coefficient
    mean1, mean2 = np.mean(hist1), np.mean(hist2)
    std1, std2 = np.std(hist1), np.std(hist2)
    if std1 > 0 and std2 > 0:
        hist_corr = float(np.mean((hist1 - mean1) * (hist2 - mean2)) / (std1 * std2))
    else:
        hist_corr = 0.0

    # Structural similarity (mean/std comparison)
    structural = 1.0 - min(abs(float(np.mean(face1)) - float(np.mean(face2))) / 128.0, 1.0)

    # Texture similarity using gradient magnitudes
    def gradient_mag(img):
        gy = np.diff(img, axis=0)
        gx = np.diff(img, axis=1)
        return np.sqrt(gy[:, :-1]**2 + gx[:-1, :]**2)

    gm1 = gradient_mag(face1)
    gm2 = gradient_mag(face2)
    if gm1.size > 0 and gm2.size > 0:
        gm1_norm = gm1 / (gm1.max() + 1e-10)
        gm2_norm = gm2 / (gm2.max() + 1e-10)
        texture_sim = 1.0 - min(float(np.mean(np.abs(gm1_norm - gm2_norm))), 1.0)
    else:
        texture_sim = 0.0

    # Weighted combination
    similarity = (hist_corr * 0.35 + structural * 0.35 + texture_sim * 0.3)
    similarity = max(0.0, min(1.0, similarity))

    return round(similarity * 100, 1)


def run_face_verification(doc_image_path: str, presented_image_path: str) -> Dict[str, Any]:
    doc_faces = detect_faces_pil(doc_image_path)
    presented_faces = detect_faces_pil(presented_image_path)

    doc_detected = len(doc_faces) > 0
    presented_detected = len(presented_faces) > 0

    if not doc_detected:
        return {
            "status": "NOT_DETECTED",
            "similarity_score": 0.0,
            "document_face_detected": False,
            "presented_face_detected": presented_detected,
            "explanation": "No face detected in document image",
        }

    if not presented_detected:
        return {
            "status": "NOT_DETECTED",
            "similarity_score": 0.0,
            "document_face_detected": True,
            "presented_face_detected": False,
            "explanation": "No face detected in presented person image",
        }

    doc_face = max(doc_faces, key=lambda f: f["w"] * f["h"])
    presented_face = max(presented_faces, key=lambda f: f["w"] * f["h"])

    similarity = compute_face_similarity(doc_face["face_data"], presented_face["face_data"])

    if similarity >= 65:
        status = "MATCH"
        explanation = f"Strong face similarity: {similarity}%"
    elif similarity >= 40:
        status = "POSSIBLE_MATCH"
        explanation = f"Moderate face similarity: {similarity}% - requires manual review"
    else:
        status = "MISMATCH"
        explanation = f"Low face similarity: {similarity}% - faces appear different"

    return {
        "status": status,
        "similarity_score": similarity,
        "document_face_detected": True,
        "presented_face_detected": True,
        "explanation": explanation,
    }
