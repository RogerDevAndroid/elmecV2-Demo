import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Always redirect to login screen first
    const timer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      }
    }, 100); // Small delay to ensure proper initialization

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, router]);

  // Show loading state while determining auth status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1e40af" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e40af',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginTop: 16,
  },
});
