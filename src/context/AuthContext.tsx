import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api, { apiErrorMessage } from '../lib/api';

export type Role = 'USER' | 'KSATRIA_KOMUNITAS' | 'ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  name: string;
  city: string | null;
  bio: string | null;
  avatarColor: string;
  role: Role;
  karma: number;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; name: string; password: string; city?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'qpeduli_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: AuthContextValue['login'] = async (identifier, password) => {
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err, 'Gagal masuk. Periksa email/username dan kata sandi.'));
    }
  };

  const register: AuthContextValue['register'] = async (payload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err, 'Gagal mendaftar. Coba lagi.'));
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
