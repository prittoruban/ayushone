"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@/lib/supabase";
import { User as AppUser } from "@/lib/database.types";

interface AuthContextType {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: { name: string; role: "doctor" | "citizen"; phone?: string }
  ) => Promise<{ data: unknown; error: unknown }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: unknown; error: unknown }>;
  signInWithGoogle: () => Promise<{ data: unknown; error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentClient());

  const fetchUserProfile = useCallback(
    async (userId: string, retryCount = 0) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          // PGRST116 means "not found" - might be new OAuth user or profile being created
          if (error.code === "PGRST116") {
            console.log(
              "User profile not found (attempt " + (retryCount + 1) + ")"
            );

            // Retry up to 3 times with delay for new OAuth users
            if (retryCount < 3) {
              console.log("Retrying in 1 second...");
              setTimeout(() => {
                fetchUserProfile(userId, retryCount + 1);
              }, 1000);
            } else {
              console.log(
                "Profile still not found after retries - new OAuth user:",
                userId
              );
              setUserProfile(null);
            }
          } else {
            console.error("Error fetching user profile:", error);
          }
          return;
        }

        console.log("User profile loaded:", data.email);
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log(
          "Initial session check:",
          session?.user?.email || "No user"
        );
        setUser(session?.user || null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth state changed:",
        event,
        session?.user?.email || "No user"
      );

      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchUserProfile]);

  const signUp = async (
    email: string,
    password: string,
    userData: { name: string; role: "doctor" | "citizen"; phone?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      return { data, error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { data: null, error };
      }

      console.log("Sign in successful:", data.user?.email);

      // Fetch user profile after successful login
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth initiation error:", error);
      }

      return { data, error };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }

      console.log("Sign out successful, clearing state...");

      // Force clear local state immediately
      setUser(null);
      setUserProfile(null);

      // Redirect to home page
      console.log("Redirecting to home page...");
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, try to clear state and redirect
      setUser(null);
      setUserProfile(null);
      window.location.href = "/";
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
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
