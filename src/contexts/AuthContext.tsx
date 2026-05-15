import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getCurrentProfile, login, logout, resetPassword, watchAuth } from '../services/authService';
import type { UserProfile } from '../types';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(user: User | null) {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfile(await getCurrentProfile(user.uid));
  }

  useEffect(() => {
    return watchAuth(async (user) => {
      setFirebaseUser(user);
      await loadProfile(user);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      signIn: async (email, password) => {
        const result = await login(email, password);
        setFirebaseUser(result.user);
        await loadProfile(result.user);
      },
      signOut: async () => {
        await logout();
        setFirebaseUser(null);
        setProfile(null);
      },
      sendReset: resetPassword,
      refreshProfile: () => loadProfile(firebaseUser),
    }),
    [firebaseUser, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
