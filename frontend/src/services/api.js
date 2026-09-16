const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('vd_token') || ''
}

async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return res.json()
}

export const authAPI = {
  login: (data) => api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => api('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => api('/auth/me'),
}

export const docAPI = {
  list: () => api('/documents/'),
  upload: (data) => api('/documents/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => api(`/documents/${id}`, { method: 'DELETE' }),
}

export const userAPI = {
  listAgents: () => api('/users/agents'),
  createAgent: (data) => api('/users/agents', { method: 'POST', body: JSON.stringify(data) }),
  disableAgent: (id) => api(`/users/agents/${id}/disable`, { method: 'PATCH' }),
  deleteAgent: (id) => api(`/users/agents/${id}`, { method: 'DELETE' }),
}

export const orderAPI = {
  list: () => api('/orders/'),
  create: (data) => api('/orders/', { method: 'POST', body: JSON.stringify(data) }),
}

export const convAPI = {
  list: () => api('/conversations/'),
  start: (phone) => api('/conversations/', { method: 'POST', body: JSON.stringify({ customer_phone: phone }) }),
  addMessage: (sessionId, speaker, text) => 
    api(`/conversations/${sessionId}/message`, { method: 'POST', body: JSON.stringify({ speaker, text }) }),
  resolve: (sessionId) => api(`/conversations/${sessionId}/resolve`, { method: 'PATCH' }),
  escalate: (sessionId) => api(`/conversations/${sessionId}/escalate`, { method: 'PATCH' }),
}

export const analyticsAPI = {
  get: () => api('/analytics/'),
}