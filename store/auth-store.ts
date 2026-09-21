import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (token: string) => void;
  setUser: (user: Partial<User> & { name: string; email: string; role: string }) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token) =>
        set({
          token,
          isAuthenticated: true,
        }),

      setUser: (user) => {
        const id = (user as any)?.userId || (user as any)?._id || (user as any)?.id || '';
        set({
          user: {
            ...user,
            userId: id,
            _id: id,
          },
        });
      },

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'blog-auth',
    }
  )
);
