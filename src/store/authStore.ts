import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login } from '../api/authApi';

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem('authToken'),
      username: localStorage.getItem('username'),
      role: localStorage.getItem('userRole'),
      isAuthenticated: !!localStorage.getItem('authToken'),
      isLoading: false,
      error: null,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const data = await login({ username, password });
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('username', username);
          
          set({
            token: data.token,
            username: username,
            role: data.role,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          // Handle error
          const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        
        set({
          token: null,
          username: null,
          role: null,
          isAuthenticated: false
        });
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        username: state.username, 
        role: state.role, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore; 