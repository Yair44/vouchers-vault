import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPreviewMode: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Detect if we're in Lovable preview environment - very restrictive to prevent production activation
  const isPreviewMode = (() => {
    const hostname = window.location.hostname;
    const href = window.location.href;
    
    // Only activate for exact Lovable preview patterns and never for custom domains
    const isLovablePreview = (
      // Lovable project preview URLs
      hostname.endsWith('.lovableproject.com') ||
      hostname.endsWith('.lovable.app') ||
      // Lovable editor preview (with UUID pattern)
      (hostname.includes('lovableproject.com') && href.includes('a0a4cadc-30e3-4451-b806-4ee4b9f085b0'))
    );
    
    // Additional safety check - never activate if hostname looks like a custom domain
    const isCustomDomain = !hostname.includes('lovable') && !hostname.includes('localhost');
    
    return isLovablePreview && !isCustomDomain;
  })();

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const signOut = async () => {
    try {
      if (!isPreviewMode) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // In preview mode, create a mock user session
    if (isPreviewMode) {
      const mockUser = {
        id: 'preview-user-123',
        email: 'preview@example.com',
        user_metadata: { full_name: 'Preview User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        confirmed_at: new Date().toISOString(),
      } as User;

      const mockSession = {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      } as Session;

      setUser(mockUser);
      setSession(mockSession);
      setIsAdmin(true); // Grant admin privileges in preview mode
      setIsLoading(false);
      return;
    }

    // Set up auth state listener for production
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check admin status after setting user
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isPreviewMode]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAdmin,
      isPreviewMode,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};