import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only navigate after loading is complete and component is stable
    if (!loading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth');
        }
      }, 100); // Small delay to ensure proper initialization

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while determining auth status
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Fallback UI (should not be visible due to navigation)
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Inicializando...</Text>
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
