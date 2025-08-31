"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with error handling for stale tokens
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        // If refresh token error, clear the session
        if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error("Auth initialization error:", error);
      // Clear potentially corrupted session
      supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // First clear any existing session to avoid conflicts
    await supabase.auth.signOut();
    
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    return result;
  };

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    return result;
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
