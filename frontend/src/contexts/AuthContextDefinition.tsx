import { AuthError } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';
import { createContext } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  session: Session | null;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
