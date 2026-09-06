import numpy as np
from PIL import Image, ImageFilter
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


def pil_to_gray_array(image_path: str):
    try:
        img = Image.open(image_path).convert("L")
        return np.array(img, dtype=np.float64)
    except Exception as e:
        logger.error(f"Could not load image: {e}")
        return None


def simple_laplacian(block):
    """Simplified Laplacian-like edge detection using numpy."""
    kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float64)
    h, w = block.shape
    if h < 3 or w < 3:
        return np.zeros_like(block)
    result = np.zeros_like(block)
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            result[y, x] = np.sum(block[y-1:y+2, x-1:x+2] * kernel)
    return result


def simple_sobel_x(block):
    """Simple Sobel X gradient."""
    kernel = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float64)
    h, w = block.shape
    if h < 3 or w < 3:
        return np.zeros_like(block)
    result = np.zeros_like(block)
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            result[y, x] = np.sum(block[y-1:y+2, x-1:x+2] * kernel)
    return result


def simple_sobel_y(block):
    """Simple Sobel Y gradient."""
    kernel = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float64)
    h, w = block.shape
    if h < 3 or w < 3:
        return np.zeros_like(block)
    result = np.zeros_like(block)
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            result[y, x] = np.sum(block[y-1:y+2, x-1:x+2] * kernel)
    return result


def simple_canny(gray, low=50, high=150):
    """Simplified Canny-like edge detection."""
    sx = simple_sobel_x(gray)
    sy = simple_sobel_y(gray)
    mag = np.sqrt(sx**2 + sy**2)
    mag = (mag / mag.max() * 255).astype(np.uint8) if mag.max() > 0 else mag.astype(np.uint8)
    edges = np.zeros_like(mag)
    edges[mag > low] = 255
    return edges


def analyze_noise_pattern(image_path: str) -> Dict[str, Any]:
    gray = pil_to_gray_array(image_path)
    if gray is None:
        return {"score": 0, "regions": [], "explanation": "Could not load image"}

    h, w = gray.shape
    block_size = 64
    noise_map = []

    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block = gray[y:y+block_size, x:x+block_size]
            laplacian = simple_laplacian(block)
            noise_val = float(np.std(laplacian))
            noise_map.append({
                "x": int(x), "y": int(y),
                "w": block_size, "h": block_size,
                "noise": noise_val
            })

    if not noise_map:
        return {"score": 0, "regions": [], "explanation": "Image too small for analysis"}

    noises = [n["noise"] for n in noise_map]
    mean_noise = np.mean(noises)
    std_noise = np.std(noises)

    suspicious = []
    threshold = mean_noise + 2.5 * std_noise if std_noise > 0 else mean_noise * 2

    for region in noise_map:
        if region["noise"] > threshold and region["noise"] > 50:
            suspicious.append({
                "x": region["x"], "y": region["y"],
                "w": region["w"], "h": region["h"],
                "reason": f"Unusual noise level: {region['noise']:.1f} (avg: {mean_noise:.1f})",
                "type": "noise_anomaly"
            })

    risk = min(len(suspicious) * 15, 80)

    return {
        "score": risk,
        "regions": suspicious[:5],
        "explanation": f"Found {len(suspicious)} regions with unusual noise patterns" if suspicious else "Noise patterns appear consistent",
    }


def analyze_color_consistency(image_path: str) -> Dict[str, Any]:
    try:
        img = Image.open(image_path).convert("RGB")
        rgb = np.array(img, dtype=np.float64)
    except Exception:
        return {"score": 0, "regions": [], "explanation": "Could not load image"}

    r_mean = np.mean(rgb[:, :, 0])
    g_mean = np.mean(rgb[:, :, 1])
    b_mean = np.mean(rgb[:, :, 2])

    r_std = np.std(rgb[:, :, 0])
    g_std = np.std(rgb[:, :, 1])
    b_std = np.std(rgb[:, :, 2])

    h_img, w_img = rgb.shape[:2]
    block_size = 48
    suspicious = []

    for y in range(0, h_img - block_size, block_size // 2):
        for x in range(0, w_img - block_size, block_size // 2):
            block = rgb[y:y+block_size, x:x+block_size]
            local_r = np.mean(block[:, :, 0])
            local_g = np.mean(block[:, :, 1])
            local_b = np.mean(block[:, :, 2])

            r_shift = abs(local_r - r_mean) / (r_std + 1e-6)
            g_shift = abs(local_g - g_mean) / (g_std + 1e-6)
            b_shift = abs(local_b - b_mean) / (b_std + 1e-6)

            max_shift = max(r_shift, g_shift, b_shift)
            if max_shift > 3.0:
                suspicious.append({
                    "x": int(x), "y": int(y),
                    "w": block_size, "h": block_size,
                    "reason": f"Color shift: R={local_r:.0f}(avg {r_mean:.0f}), G={local_g:.0f}(avg {g_mean:.0f}), B={local_b:.0f}(avg {b_mean:.0f})",
                    "type": "color_inconsistency"
                })

    merged = merge_regions(suspicious)
    risk = min(len(merged) * 20, 70)

    return {
        "score": risk,
        "regions": merged[:5],
        "explanation": f"Found {len(merged)} color-inconsistent regions" if merged else "Color distribution appears consistent",
    }


def analyze_edge_consistency(image_path: str) -> Dict[str, Any]:
    gray = pil_to_gray_array(image_path)
    if gray is None:
        return {"score": 0, "regions": [], "explanation": "Could not load image"}

    edges = simple_canny(gray)
    h, w = edges.shape
    block_size = 64
    edge_density = []

    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block = edges[y:y+block_size, x:x+block_size]
            density = float(np.mean(block) / 255.0)
            edge_density.append({
                "x": int(x), "y": int(y),
                "w": block_size, "h": block_size,
                "density": density
            })

    if not edge_density:
        return {"score": 0, "regions": [], "explanation": "Image too small"}

    densities = [e["density"] for e in edge_density]
    mean_d = np.mean(densities)
    std_d = np.std(densities)

    suspicious = []
    for region in edge_density:
        if std_d > 0 and region["density"] > mean_d + 3 * std_d:
            suspicious.append({
                "x": region["x"], "y": region["y"],
                "w": region["w"], "h": region["h"],
                "reason": f"Unusually high edge density: {region['density']:.3f} (avg: {mean_d:.3f})",
                "type": "edge_anomaly"
            })

    risk = min(len(suspicious) * 15, 60)

    return {
        "score": risk,
        "regions": suspicious[:5],
        "explanation": f"Found {len(suspicious)} suspicious edge regions" if suspicious else "Edge patterns appear consistent",
    }


def analyze_compression(image_path: str) -> Dict[str, Any]:
    gray = pil_to_gray_array(image_path)
    if gray is None:
        return {"score": 0, "regions": [], "explanation": "Could not load image"}

    block_size = 8
    h, w = gray.shape
    block_vars = []

    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block = gray[y:y+block_size, x:x+block_size]
            var = float(np.var(block))
            block_vars.append({
                "x": int(x), "y": int(y),
                "w": block_size, "h": block_size,
                "variance": var
            })

    if not block_vars:
        return {"score": 0, "regions": [], "explanation": "Image too small"}

    variances = [b["variance"] for b in block_vars]
    mean_var = np.mean(variances)

    suspicious = []
    for block in block_vars:
        if block["variance"] > mean_var * 4 and block["variance"] > 1000:
            suspicious.append({
                "x": block["x"], "y": block["y"],
                "w": block["w"], "h": block["h"],
                "reason": f"Unusual compression pattern: variance {block['variance']:.0f} (avg: {mean_var:.0f})",
                "type": "compression_anomaly"
            })

    risk = min(len(suspicious) * 10, 50)

    return {
        "score": risk,
        "regions": suspicious[:5],
        "explanation": f"Found {len(suspicious)} compression anomalies" if suspicious else "Compression patterns appear uniform",
    }


def merge_regions(regions: List[Dict]) -> List[Dict]:
    if not regions:
        return []

    merged = []
    used = set()

    for i, r1 in enumerate(regions):
        if i in used:
            continue
        group = [r1]
        for j, r2 in enumerate(regions):
            if j <= i or j in used:
                continue
            if (r1["x"] < r2["x"] + r2["w"] and r1["x"] + r1["w"] > r2["x"] and
                r1["y"] < r2["y"] + r2["h"] and r1["y"] + r1["h"] > r2["y"]):
                group.append(r2)
                used.add(j)

        x_min = min(g["x"] for g in group)
        y_min = min(g["y"] for g in group)
        x_max = max(g["x"] + g["w"] for g in group)
        y_max = max(g["y"] + g["h"] for g in group)

        merged.append({
            "x": x_min, "y": y_min,
            "w": x_max - x_min, "h": y_max - y_min,
            "reason": group[0]["reason"],
            "type": group[0]["type"],
            "sub_regions": len(group),
        })
        used.add(i)

    return merged


def run_tampering_detection(image_path: str) -> Dict[str, Any]:
    results = {
        "noise": analyze_noise_pattern(image_path),
        "color": analyze_color_consistency(image_path),
        "edges": analyze_edge_consistency(image_path),
        "compression": analyze_compression(image_path),
    }

    all_regions = []
    explanations = []
    scores = []

    for analysis_name, result in results.items():
        scores.append(result["score"])
        all_regions.extend(result["regions"])
        if result["score"] > 20:
            explanations.append(f"{analysis_name.title()}: {result['explanation']}")

    avg_score = np.mean(scores) if scores else 0
    max_score = max(scores) if scores else 0

    final_score = (avg_score * 0.4 + max_score * 0.6)
    final_score = min(float(final_score), 100)

    if final_score > 50:
        status = "SUSPICIOUS"
    elif final_score > 25:
        status = "WARNING"
    else:
        status = "PASS"

    merged_regions = merge_regions(all_regions)

    return {
        "status": status,
        "risk_score": round(final_score, 1),
        "suspicious_regions": merged_regions,
        "explanations": explanations if explanations else ["No significant tampering indicators detected"],
        "details": {k: {"score": v["score"], "explanation": v["explanation"]} for k, v in results.items()},
    }
