import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData, token) => {
        if (token) localStorage.setItem('token', token); // Optional if using strictly cookies, but sometimes used for Bearer fallback
        set({ user: userData, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (userData) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null 
        }))
    }),
    {
      name: 'auth-storage',
    }
  )
);
