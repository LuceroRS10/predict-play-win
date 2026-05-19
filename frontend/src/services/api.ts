import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('ppw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('ppw_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ======================
// AUTH
// ======================
export const authAPI = {
  register: (data: { username: string; email: string; password: string; favoriteClub?: string; country?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  uploadPhoto: (formData: FormData) =>
    api.post('/auth/profile-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ======================
// TOURNAMENTS
// ======================
export const tournamentAPI = {
  list: (params?: { status?: string }) => api.get('/tournaments', { params }),
  get: (id: string) => api.get(`/tournaments/${id}`),
  create: (data: any) => api.post('/tournaments', data),
  addPlayer: (id: string, userId: string) => api.post(`/tournaments/${id}/add-player`, { userId }),
  removePlayer: (id: string, userId: string) => api.post(`/tournaments/${id}/remove-player`, { userId }),
  start: (id: string) => api.post(`/tournaments/${id}/start`),
  cancel: (id: string) => api.post(`/tournaments/${id}/cancel`),
  standings: (id: string) => api.get(`/tournaments/${id}/standings`),
  advanceToKnockout: (id: string) => api.post(`/tournaments/${id}/advance-to-knockout`),
  knockout: (id: string) => api.get(`/tournaments/${id}/knockout`),
};

// ======================
// PREDICTIONS
// ======================
export const predictionAPI = {
  getForMatchday: (matchdayId: string) => api.get(`/predictions/matchday/${matchdayId}`),
  submit: (data: { fixtureId: string; prediction: string }) => api.post('/predictions', data),
  submitBatch: (predictions: { fixtureId: string; prediction: string }[]) =>
    api.post('/predictions/batch', { predictions }),
  getH2H: (matchId: string) => api.get(`/predictions/h2h/${matchId}`),
};

// ======================
// CHALLENGES
// ======================
export const challengeAPI = {
  list: () => api.get('/challenges'),
  create: (data: { challengedId: string; leagueId: string }) => api.post('/challenges', data),
  accept: (id: string) => api.post(`/challenges/${id}/accept`),
  reject: (id: string) => api.post(`/challenges/${id}/reject`),
  predict: (id: string, predictions: { fixtureId: string; prediction: string }[]) =>
    api.post(`/challenges/${id}/predict`, { predictions }),
};

// ======================
// LEADERBOARD
// ======================
export const leaderboardAPI = {
  global: (params?: { page?: number; limit?: number }) => api.get('/leaderboard/global', { params }),
  topPerformers: () => api.get('/leaderboard/top-performers'),
  tournament: (id: string) => api.get(`/leaderboard/tournament/${id}`),
};

// ======================
// PLAYERS
// ======================
export const playerAPI = {
  list: (params?: { search?: string; page?: number; limit?: number }) => api.get('/players', { params }),
  get: (id: string) => api.get(`/players/${id}`),
};

// ======================
// NOTIFICATIONS
// ======================
export const notificationAPI = {
  list: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ======================
// ADMIN
// ======================
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  settings: () => api.get('/admin/settings'),
  updateSettings: (settings: { key: string; value: string }[]) => api.put('/admin/settings', { settings }),
  users: (params?: { search?: string; page?: number }) => api.get('/admin/users', { params }),
  syncLeagues: () => api.post('/admin/leagues/sync'),
  overrideFixture: (id: string, data: any) => api.put(`/admin/fixtures/${id}`, data),
  excludeFixture: (id: string) => api.post(`/admin/fixtures/${id}/exclude`),
  includeFixture: (id: string) => api.post(`/admin/fixtures/${id}/include`),
  scoreMatchday: (id: string) => api.post(`/admin/matchdays/${id}/score`),
};

export default api;
