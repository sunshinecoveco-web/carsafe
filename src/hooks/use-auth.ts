"use client";

import { useState, useEffect } from 'react';

export type UserRole = 'owner' | 'dealer' | 'reseller' | 'insurance';

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
}

const defaultAuth: AuthState = { isAuthenticated: false, role: null, userId: null };

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);

  useEffect(() => {
    // This runs only on the client
    const storedAuth = localStorage.getItem('carsafe_user');
    if (storedAuth) {
      try {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        if (parsedAuth.isAuthenticated) {
          setAuth(parsedAuth);
        } else {
          setAuth(defaultAuth);
        }
      } catch (e) {
        console.error("Failed to parse auth data from localStorage", e);
        setAuth(defaultAuth);
      }
    }
  }, []);

  return auth;
}
