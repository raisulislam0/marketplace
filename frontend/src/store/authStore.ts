import { create } from 'zustand';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await api.post<AuthResponse>('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      set({ token: access_token });

      // Fetch user data
      const userResponse = await api.get<User>('/auth/me');
      set({ user: userResponse.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<User>('/auth/register', data);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await api.get<User>('/auth/me');
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem('token');
    }
  },

  setUser: (user) => set({ user }),
}));

