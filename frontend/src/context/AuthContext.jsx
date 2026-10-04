import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, USER_ROLES, ROUTES } from '../constants';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => {
    async function login(payload) {
      const data = await authService.login(payload);
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      setUser(data.user);
      return data.user;
    }

    async function logout() {
      try {
        await authService.logout();
      } catch {
        // Local session is cleared even if the server is unreachable.
      }
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setUser(null);
    }

    function homeFor(role) {
      return role === USER_ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.MEMBER_DASHBOARD;
    }

    return { user, loading, login, logout, setUser, homeFor };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
