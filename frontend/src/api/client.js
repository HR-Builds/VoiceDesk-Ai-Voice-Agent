const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'vd_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); }

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    setToken(null);
    window.dispatchEvent(new Event('vd:logout'));
    throw new Error('Session expired. Dobara login karo.');
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { const d = await res.json(); detail = typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail); } catch {}
    throw new Error(detail || 'Request failed');
  }
  return res.json();
}