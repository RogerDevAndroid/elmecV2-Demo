import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface HealthStatus {
  isConnected: boolean;
  isAuthenticated: boolean;
  databaseAccessible: boolean;
  realtimeConnected: boolean;
  lastChecked: Date;
  errors: string[];
}

export const useSupabaseHealth = () => {
  const [health, setHealth] = useState<HealthStatus>({
    isConnected: false,
    isAuthenticated: false,
    databaseAccessible: false,
    realtimeConnected: false,
    lastChecked: new Date(),
    errors: [],
  });

  const checkHealth = async () => {
    const errors: string[] = [];
    let isConnected = false;
    let isAuthenticated = false;
    let databaseAccessible = false;
    let realtimeConnected = false;

    try {
      // Check basic connection
      const {
        data: { session },
      } = await supabase.auth.getSession();
      isConnected = true;
      isAuthenticated = !!session;

      // Check database access
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        if (error) {
          errors.push(`Database error: ${error.message}`);
        } else {
          databaseAccessible = true;
        }
      } catch (dbError: any) {
        errors.push(`Database connection failed: ${dbError.message}`);
      }

      // Check realtime (basic test)
      try {
        const channel = supabase.channel('health-check');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Realtime connection timeout'));
          }, 5000);

          channel
            .on('presence', { event: 'sync' }, () => {
              clearTimeout(timeout);
              realtimeConnected = true;
              resolve(true);
            })
            .subscribe(status => {
              if (status === 'SUBSCRIBED') {
                clearTimeout(timeout);
                realtimeConnected = true;
                resolve(true);
              } else if (status === 'CHANNEL_ERROR') {
                clearTimeout(timeout);
                reject(new Error('Realtime channel error'));
              }
            });
        });

        supabase.removeChannel(channel);
      } catch (realtimeError: any) {
        errors.push(`Realtime error: ${realtimeError.message}`);
      }
    } catch (connectionError: any) {
      errors.push(`Connection error: ${connectionError.message}`);
    }

    setHealth({
      isConnected,
      isAuthenticated,
      databaseAccessible,
      realtimeConnected,
      lastChecked: new Date(),
      errors,
    });
  };

  useEffect(() => {
    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    health,
    checkHealth,
    isHealthy:
      health.isConnected &&
      health.databaseAccessible &&
      health.errors.length === 0,
  };
};
