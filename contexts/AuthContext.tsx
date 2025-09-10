import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
      password: string;
    }
  ) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 Sesión inicial obtenida:', session ? 'Existe' : 'No existe');
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Cambio de autenticación detectado:', event, session ? 'Sesión activa' : 'Sin sesión');
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        console.log('🚪 Limpiando estado de usuario...');
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Computed value for authentication status
  const isAuthenticated = !!user && !!session;

  // Exponer funciones para debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).AuthContext = {
        user,
        isAuthenticated,
        logout,
        session
      };
    }
  }, [user, isAuthenticated, session]);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error.message);
        // If user doesn't exist in users table, sign out
        if (error.code === 'PGRST116') {
          console.log('User profile not found, signing out...');
          await supabase.auth.signOut();
          return;
        }
      } else {
        setUser(data);

        // Update user online status
          try {
            const updateData = {
              is_online: true,
              last_seen: new Date().toISOString(),
              last_login: new Date().toISOString(),
            };
            const { error: updateError } = await (supabase as any)
              .from('users')
              .update(updateData)
              .eq('id', userId);
            
            if (updateError) {
              console.error('Error updating user status:', updateError);
            }
          } catch (updateErr) {
            console.error('Failed to update user status:', updateErr);
          }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        // Re-throw with more specific error information
        const enhancedError = {
          ...error,
          code: error.message?.includes('Invalid login credentials') ? 'invalid_credentials' : error.code,
          userMessage: error.message?.includes('Invalid login credentials') 
            ? 'Email o contraseña incorrectos'
            : error.message
        };
        throw enhancedError;
      }

      if (data.user) {
        try {
          await loadUserProfile(data.user.id);
          return true;
        } catch (profileError) {
          console.error('Profile loading error:', profileError);
          // If profile loading fails, still consider login successful
          // but log the error for debugging
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
      password: string;
    }
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.correo_electronico,
        password: userData.password,
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        return false;
      }

      if (authData.user) {
        // Create user profile
        const { password, ...userProfile } = userData;
        const profileData = {
            id: authData.user.id,
            email: authData.user.email!,
            nombre: userProfile.nombre,
            apellido_paterno: userProfile.apellido_paterno,
            apellido_materno: userProfile.apellido_materno,
            empresa: userProfile.empresa,
            celular: userProfile.celular,
            correo_electronico: userProfile.correo_electronico,
            ciudad: userProfile.ciudad,
            estado: userProfile.estado,
            rol: 'customer' as const,
            activo: true,
            is_online: false,
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        
        const { error: profileError } = await (supabase as any)
          .from('users')
          .insert(profileData);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return false;
        }



        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Iniciando proceso de logout...');
      setLoading(true);

      // Update user status to offline
      if (user) {
        console.log('👤 Actualizando estado del usuario a offline...');
        try {
          const updateData = {
            is_online: false,
            last_seen: new Date().toISOString(),
          };
          const { error: updateError } = await (supabase as any)
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          
          if (updateError) {
            console.error('❌ Error updating user status on logout:', updateError);
          } else {
            console.log('✅ Estado del usuario actualizado correctamente');
          }
        } catch (updateErr) {
          console.error('❌ Failed to update user status on logout:', updateErr);
        }
      }

      console.log('🚪 Cerrando sesión en Supabase...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
      } else {
        console.log('✅ Sesión cerrada correctamente en Supabase');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Proceso de logout finalizado');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
