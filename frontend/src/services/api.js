import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const questService = {
  // Get all quests
  getQuests: async () => {
    const response = await api.get('/quests');
    return response.data;
  },

  // Get specific quest
  getQuest: async (questId) => {
    const response = await api.get(`/quests/${questId}`);
    return response.data;
  },

  // Check in at a quest checkpoint
  checkIn: async (questId, checkpointId) => {
    const response = await api.post(`/quests/${questId}/check_in`, {
      checkpoint_id: checkpointId
    });
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  }
};

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response.data;
  },

  // Sign up user
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('authToken') !== null;
  }
};

export default api;