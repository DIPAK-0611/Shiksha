import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type UserProfile = {
  name: string;
  email: string;
  role: string;
  notifications: {
    emailAlerts: boolean;
    weeklyDigest: boolean;
  };
};

type UserContextType = {
  session: Session | null;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Mentor',
    email: '',
    role: 'Mentor / Faculty',
    notifications: {
      emailAlerts: true,
      weeklyDigest: true
    }
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setProfile(prev => ({ 
          ...prev, 
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Mentor',
          role: session.user.user_metadata?.role || 'Mentor / Faculty',
          notifications: session.user.user_metadata?.notifications || {
            emailAlerts: true,
            weeklyDigest: true
          }
        }));
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setProfile(prev => ({ 
          ...prev, 
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Mentor',
          role: session.user.user_metadata?.role || 'Mentor / Faculty',
          notifications: session.user.user_metadata?.notifications || {
            emailAlerts: true,
            weeklyDigest: true
          }
        }));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ session, profile, setProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
