import { api } from '../api/client';

export const authAPI = {
  login: (data) =>
    api('/auth/login', {
      method: 'POST',
      body: data,
      auth: false,
    }),

  register: (data) =>
    api('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    }),

  me: () =>
    api('/auth/me'),
};

export const docAPI = {
  list: () =>
    api('/documents/'),

  upload: (data) =>
    api('/documents/', {
      method: 'POST',
      body: data,
    }),

  delete: (id) =>
    api(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

export const userAPI = {
  listAgents: () =>
    api('/users/agents'),

  createAgent: (data) =>
    api('/users/agents', {
      method: 'POST',
      body: data,
    }),

  disableAgent: (id) =>
    api(`/users/agents/${id}/disable`, {
      method: 'PATCH',
    }),

  deleteAgent: (id) =>
    api(`/users/agents/${id}`, {
      method: 'DELETE',
    }),
};

export const orderAPI = {
  list: () =>
    api('/orders/'),

  create: (data) =>
    api('/orders/', {
      method: 'POST',
      body: data,
    }),
};

export const convAPI = {
  list: () =>
    api('/conversations/'),

  start: (phone) =>
    api('/conversations/', {
      method: 'POST',
      body: {
        customer_phone: phone,
      },
    }),

  addMessage: (sessionId, speaker, text) =>
    api(`/conversations/${sessionId}/message`, {
      method: 'POST',
      body: {
        speaker,
        text,
      },
    }),

  resolve: (sessionId) =>
    api(`/conversations/${sessionId}/resolve`, {
      method: 'PATCH',
    }),

  escalate: (sessionId) =>
    api(`/conversations/${sessionId}/escalate`, {
      method: 'PATCH',
    }),
};

export const analyticsAPI = {
  get: () =>
    api('/analytics/'),
};