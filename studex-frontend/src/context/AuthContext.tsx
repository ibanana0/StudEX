'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '@/utils/api';
import { useUserStore } from '@/stores/userStore';
import type { AuthPayload, Role, SessionMode, User } from '@/types';

const TOKEN_STORAGE_KEY = 'token';
const SESSION_MODE_STORAGE_KEY = 'session_mode';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  sessionMode: SessionMode | null;
  isLoading: boolean;
  needsProfileCompletion: boolean;
  canUseDriverMode: boolean;
  setAuth: (payload: AuthPayload) => void;
  refreshMe: () => Promise<AuthPayload | null>;
  logout: () => void;
  setSessionMode: (mode: SessionMode | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getStoredSessionMode(): SessionMode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = sessionStorage.getItem(SESSION_MODE_STORAGE_KEY);
  return value === 'BUYER' || value === 'DRIVER' ? value : null;
}

function deriveStoreRole(user: User, sessionMode: SessionMode | null): Role {
  if (user.role === 'ADMIN') {
    return 'ADMIN';
  }

  if (sessionMode === 'DRIVER') {
    return 'DRIVER';
  }

  return 'USER';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionMode, setSessionModeState] = useState<SessionMode | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [canUseDriverMode, setCanUseDriverMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setSessionMode = useCallback((mode: SessionMode | null) => {
    setSessionModeState(mode);

    if (typeof window === 'undefined') {
      return;
    }

    if (mode) {
      sessionStorage.setItem(SESSION_MODE_STORAGE_KEY, mode);
    } else {
      sessionStorage.removeItem(SESSION_MODE_STORAGE_KEY);
    }
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    setNeedsProfileCompletion(false);
    setCanUseDriverMode(false);
    setSessionMode(null);
    useUserStore.getState().resetUser();

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [setSessionMode]);

  const setAuth = useCallback((payload: AuthPayload) => {
    if (payload.token) {
      setToken(payload.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
      }
    }

    setUser(payload.user);
    setNeedsProfileCompletion(payload.needsProfileCompletion);
    setCanUseDriverMode(payload.canUseDriverMode);

    if (payload.user.role === 'ADMIN') {
      setSessionMode(null);
      return;
    }

    if (payload.canUseDriverMode) {
      setSessionMode(getStoredSessionMode());
      return;
    }

    setSessionMode('BUYER');
  }, [setSessionMode]);

  const refreshMe = useCallback(async (): Promise<AuthPayload | null> => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      clearAuthState();
      return null;
    }

    try {
      const { data } = await api.get<AuthPayload>('/auth/me');
      setToken(existingToken);
      setUser(data.user);
      setNeedsProfileCompletion(data.needsProfileCompletion);
      setCanUseDriverMode(data.canUseDriverMode);

      if (data.user.role === 'ADMIN') {
        setSessionMode(null);
      } else if (data.canUseDriverMode) {
        setSessionMode(getStoredSessionMode());
      } else {
        setSessionMode('BUYER');
      }

      return data;
    } catch {
      clearAuthState();
      return null;
    }
  }, [clearAuthState, setSessionMode]);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const existingToken = getStoredToken();
      if (!existingToken) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      await refreshMe();

      if (mounted) {
        setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [refreshMe]);

  useEffect(() => {
    if (token || user) {
      return;
    }

    setIsLoading(false);
  }, [token, user]);

  useEffect(() => {
    if (!user) {
      useUserStore.getState().resetUser();
      return;
    }

    useUserStore.getState().hydrateFromAuth(
      user,
      deriveStoreRole(user, sessionMode),
      canUseDriverMode
    );
  }, [canUseDriverMode, sessionMode, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      sessionMode,
      isLoading,
      needsProfileCompletion,
      canUseDriverMode,
      setAuth,
      refreshMe,
      logout,
      setSessionMode,
    }),
    [
      user,
      token,
      sessionMode,
      isLoading,
      needsProfileCompletion,
      canUseDriverMode,
      setAuth,
      refreshMe,
      logout,
      setSessionMode,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
