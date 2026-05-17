'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseContextValue {
  supabase: SupabaseClient | null;
}

const SupabaseContext = createContext<SupabaseContextValue>({ supabase: null });

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);
    setSupabase(client);
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
  }
 export function useSupabase() {
 const context = useContext(SupabaseContext);
  if (!context.supabase) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
}