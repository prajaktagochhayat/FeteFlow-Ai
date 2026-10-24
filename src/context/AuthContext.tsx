import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isSupabase: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'feteflow_registered_users';
const CURRENT_USER_KEY = 'feteflow_active_user_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session?.user) {
            const activeUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Celebration Host',
            };
            setUser(activeUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
          }
        } catch (err) {
          console.warn('Supabase session fetch error:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        // Subscribe to auth state updates
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            if (session?.user) {
              const activeUser: AuthUser = {
                id: session.user.id,
                email: session.user.email || '',
                fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Celebration Host',
              };
              setUser(activeUser);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
            } else {
              setUser(null);
              localStorage.removeItem(CURRENT_USER_KEY);
            }
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        // Local Multi-User Storage Initializer
        try {
          const savedSession = localStorage.getItem(CURRENT_USER_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (mounted) setUser(parsed);
          }
        } catch (e) {
          console.warn('Failed to load local user session:', e);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw new Error(error.message);
        if (data.user) {
          const activeUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Celebration Host',
          };
          setUser(activeUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
        }
        return;
      }

      // Local Multi-User Storage Mode
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const registeredUsers: Array<{ id: string; email: string; password: string; fullName: string }> =
        usersRaw ? JSON.parse(usersRaw) : [];

      const found = registeredUsers.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!found) {
        // If no users registered yet, auto-create account for first-time convenience
        if (registeredUsers.length === 0) {
          const autoUser: AuthUser = {
            id: 'usr_' + Date.now(),
            email: email.trim(),
            fullName: email.split('@')[0],
          };
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([{ ...autoUser, password }]));
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(autoUser));
          setUser(autoUser);
          return;
        }
        throw new Error('Invalid email or password. Please check your credentials or create a new account.');
      }

      const activeUser: AuthUser = {
        id: found.id,
        email: found.email,
        fullName: found.fullName,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
      setUser(activeUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw new Error(error.message);
        if (data.user) {
          if (data.session) {
            const activeUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || '',
              fullName: fullName.trim() || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Celebration Host',
            };
            setUser(activeUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
          } else {
            throw new Error('Account created! Please check your email to verify your account, or disable "Confirm email" in your Supabase Auth dashboard for instant login.');
          }
        }
        return;
      }

      // Local Multi-User Storage Mode
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const registeredUsers: Array<{ id: string; email: string; password: string; fullName: string }> =
        usersRaw ? JSON.parse(usersRaw) : [];

      if (registeredUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      const newUser: AuthUser = {
        id: 'usr_' + Date.now(),
        email: email.trim(),
        fullName: fullName.trim() || email.split('@')[0],
      };

      registeredUsers.push({ ...newUser, password });
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(registeredUsers));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        isSupabase: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
