import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Drill, Settings as SettingsIcon } from 'lucide-react-native';

export default function CalculatorIndex() {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');

  const handleNavigation = (screenName: string) => {
    router.push(`/calculator/${screenName}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() =>
            router.push('/calculator/SettingsCalculadoraScreen' as any)
          }
        >
          <SettingsIcon size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.calculatorButton}
          onPress={() => handleNavigation('BarrenadoScreen')}
        >
          <LinearGradient
            colors={['#ffffff', '#f3f4f6']}
            style={styles.buttonGradient}
          >
            <View style={styles.buttonContent}>
              <Drill size={48} color="#1e40af" />
              <Text style={styles.buttonText}>Barrenado</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calculatorButton}
          onPress={() => handleNavigation('FresadoScreen')}
        >
          <LinearGradient
            colors={['#ffffff', '#f3f4f6']}
            style={styles.buttonGradient}
          >
            <View style={styles.buttonContent}>
              <SettingsIcon size={48} color="#1e40af" />
              <Text style={styles.buttonText}>Fresado</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 32,
  },
  calculatorButton: {
    height: 120,
    marginHorizontal: '20%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    textAlign: 'center',
  },
});
