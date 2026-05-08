import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  getRecentGames: (limit = 50) =>
    api.get(`/auth/games?limit=${limit}`),
  
  getLeaderboard: (period = 'all') =>
    api.get(`/auth/leaderboard?period=${period}`)
};

export const tablesAPI = {
  list: () =>
    api.get('/tables'),
  
  create: (data) =>
    api.post('/tables', data),
  
  get: (id) =>
    api.get(`/tables/${id}`)
};

export const questsAPI = {
  getToday: () =>
    api.get('/quests/today'),
  
  checkin: () =>
    api.post('/quests/checkin'),
  
  claimQuest: (code) =>
    api.post(`/quests/${code}/claim`)
};

export default api;
