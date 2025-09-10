import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calculator, UserPlus, LogIn } from 'lucide-react-native';

export default function Welcome() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#1e40af', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ELMEC</Text>
          </View>
          <Text style={styles.title}>Bienvenido a ELMEC</Text>
          <Text style={styles.subtitle}>
            Tu plataforma integral para solicitudes y comunicación empresarial
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/register')}
          >
            <UserPlus size={24} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <LogIn size={24} color="#1e40af" />
            <Text style={styles.secondaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.calculatorButton}
            onPress={() => router.push('/(tabs)/calculator')}
          >
            <Calculator size={20} color="#6b7280" />
            <Text style={styles.calculatorButtonText}>Usar Calculadora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Directorio de Personal</Text>
            <Text style={styles.featureDescription}>
              Accede al directorio completo con información de contacto
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Solicitudes Rápidas</Text>
            <Text style={styles.featureDescription}>
              Envía y rastrea tus solicitudes en tiempo real
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Comunicación Directa</Text>
            <Text style={styles.featureDescription}>
              Contacta directamente con el personal especializado
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  calculatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  calculatorButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  features: {
    gap: 16,
    marginBottom: 40,
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});
