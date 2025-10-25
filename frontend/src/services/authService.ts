import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  user_type: 'customer' | 'seller';
  phone_number?: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'customer' | 'seller';
  phone_number?: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
}

export const authService = {
  login: async (data: LoginData) => {
    try {
      const response = await api.post('/auth/login/', data);
      
      // Store Simple JWT access token
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        console.log('Simple JWT token stored:', response.data.access); // Debug
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register/', data);
      
      // Store Simple JWT access token
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        console.log('Simple JWT token stored after registration:', response.data.access); // Debug
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Current token:', token); // Debug
      
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error.response?.data);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile/update/', data);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data);
      throw error;
    }
  },

  // Helper methods for token management
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  }
};