import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Auth } from "firebase/auth";
import { ConfigError } from "../components/ConfigError";

let auth: Auth | undefined;

const initializeAuth = async () => {
  try {
    auth = (await import("../lib/firebase")).auth;
  } catch (error) {
    console.error("'Failed to import Firebase:'", error);
  }
};

initializeAuth();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  auth: Auth | undefined;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  error: null,
  auth: undefined
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setError(new Error("'Firebase authentication is not initialized'"));
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("'Auth state change error:'", error);
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (error) {
    return <ConfigError message={error.message} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, auth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

