const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'vd_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  t
    ? localStorage.setItem(TOKEN_KEY, t)
    : localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  let requestBody;

  // FormData = file upload
  if (body instanceof FormData) {
    requestBody = body;
    // IMPORTANT: don't set Content-Type manually.
    // Browser adds multipart/form-data boundary automatically.
  } else {
    if (body !== undefined && body !== null) {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const token = getToken();

  if (auth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (res.status === 401 && auth) {
    setToken(null);
    window.dispatchEvent(new Event('vd:logout'));
    throw new Error('Session expired. Dobara login karo.');
  }

  if (!res.ok) {
    let detail = res.statusText;

    try {
      const d = await res.json();
      detail =
        typeof d.detail === 'string'
          ? d.detail
          : JSON.stringify(d.detail);
    } catch {}

    throw new Error(detail || 'Request failed');
  }

  return res.json();
}