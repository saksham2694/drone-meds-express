
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a placeholder implementation that will be replaced with Supabase auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage (temporary solution)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // This will be implemented with Supabase
    setUser({
      id: 'temp-user-id',
      email,
      name: email.split('@')[0],
    });
    localStorage.setItem('user', JSON.stringify({
      id: 'temp-user-id',
      email,
      name: email.split('@')[0],
    }));
  };

  const signInWithGoogle = async () => {
    // This will be implemented with Supabase
    const mockUser = {
      id: 'google-user-id',
      email: 'user@example.com',
      name: 'Test User',
      photoURL: 'https://randomuser.me/api/portraits/lego/1.jpg',
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    // This will be implemented with Supabase
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
