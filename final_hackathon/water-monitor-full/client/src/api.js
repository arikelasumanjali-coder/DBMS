const TOKEN_KEY = 'wm_token';
const USER_KEY = 'wm_user';

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  save: ({ token, user }) => { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); },
  clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};

async function request(path, options = {}) {
  const token = session.token();
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (res.status === 401 && !path.startsWith('/auth/login')) { session.clear(); window.location.reload(); }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const login = (body) => request('/auth/login', { method: 'POST', body });
export const register = (body) => request('/auth/register', { method: 'POST', body });

export const api = (resource) => ({
  list: (query = '') => request(`/${resource}${query}`),
  create: (body) => request(`/${resource}`, { method: 'POST', body }),
  update: (id, body) => request(`/${resource}/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
});
export const getConsumption = (params) => request(`/consumption?${new URLSearchParams(params)}`);
