const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set JSON content-type if body is not FormData and not already set
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}

export async function apiGet(path) {
  const res = await apiFetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`[API GET] ${path} failed:`, err);
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body, options = {}) {
  const isFormData = body instanceof URLSearchParams || body instanceof FormData;
  const res = await apiFetch(path, {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
    headers: options.headers || {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`[API POST] ${path} failed:`, err);
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiUpload(path, formData) {
  const res = await apiFetch(path, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`[API UPLOAD] ${path} failed:`, err);
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}
