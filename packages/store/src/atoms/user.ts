import { atom, selector } from 'recoil';

const BACKEND_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_BACKEND_URL) ||
  'http://localhost:3000';

export interface User {
  id: string;
  name: string;
  token: string;
  isGuest?: boolean;
  email?: string;
  provider?: string;
}

export const userAtom = atom<User | null>({
  key: 'user',
  default: selector<User | null>({
    key: 'user/default',
    get: async () => {
      // Check cached localStorage user first (for fast offline / preview mode)
      let cachedUser: User | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('chessflow_user');
        if (raw) {
          try {
            cachedUser = JSON.parse(raw);
          } catch {
            /* ignore invalid json */
          }
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const user = (await response.json()) as User;
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('chessflow_user', JSON.stringify(user));
          }
          return user;
        }
      } catch {
        // Backend offline or unreachable - use cached user if available
      }
      return cachedUser;
    },
  }),
});
