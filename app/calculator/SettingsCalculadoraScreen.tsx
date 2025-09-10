import React from 'react';
import {
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Settings, Ruler, Gauge } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMedida, setVelocidad } from '@/store/calculatorSlice';
import HeaderComponent from '@/components/HeaderComponent';

const MEDIDAS = [
  { code: 'mt', label: 'Métrico', description: 'mm, m/min, cm³/min' },
  { code: 'im', label: 'Imperial', description: 'in, ft/min, in³/min' },
];

const VELOCIDAD = [
  { code: 'n', label: 'Normal', description: 'Velocidades estándar' },
  { code: 'fn', label: 'Rápido', description: 'Velocidades optimizadas' },
];

export default function SettingsCalculadoraScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const calculator = useAppSelector(state => state.calculator);

  const handleSetMedida = (code: string) => {
    dispatch(setMedida(code));
  };

  const handleSetVelocidad = (code: string) => {
    dispatch(setVelocidad(code));
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent title="Configuración" showBackButton={true} />

      <ScrollView style={styles.content}>
        <View style={styles.headerSection}>
          <Settings size={32} color="#1e40af" />
          <Text style={styles.headerTitle}>Configuración de Calculadora</Text>
          <Text style={styles.headerSubtitle}>
            Personaliza las unidades y configuraciones de cálculo
          </Text>
        </View>

        {/* Sección de Unidades de Medida */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ruler size={24} color="#1e40af" />
            <Text style={styles.sectionTitle}>Sistema de Medida</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Selecciona el sistema de unidades para los cálculos
          </Text>

          {MEDIDAS.map(medida => (
            <Pressable
              key={medida.code}
              style={[
                styles.optionButton,
                calculator.medida === medida.code &&
                  styles.optionButtonSelected,
              ]}
              onPress={() => handleSetMedida(medida.code)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionText,
                      calculator.medida === medida.code &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {medida.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      calculator.medida === medida.code &&
                        styles.optionDescriptionSelected,
                    ]}
                  >
                    {medida.description}
                  </Text>
                </View>
                {calculator.medida === medida.code && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#10b981" />
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sección de Velocidad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Gauge size={24} color="#1e40af" />
            <Text style={styles.sectionTitle}>Configuración de Velocidad</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Ajusta el modo de cálculo de velocidades
          </Text>

          {VELOCIDAD.map(velocidad => (
            <Pressable
              key={velocidad.code}
              style={[
                styles.optionButton,
                calculator.velocidad === velocidad.code &&
                  styles.optionButtonSelected,
              ]}
              onPress={() => handleSetVelocidad(velocidad.code)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionText,
                      calculator.velocidad === velocidad.code &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {velocidad.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      calculator.velocidad === velocidad.code &&
                        styles.optionDescriptionSelected,
                    ]}
                  >
                    {velocidad.description}
                  </Text>
                </View>
                {calculator.velocidad === velocidad.code && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#10b981" />
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Información</Text>
          <Text style={styles.infoText}>
            • Los cambios se aplican inmediatamente a todos los cálculos
          </Text>
          <Text style={styles.infoText}>
            • El sistema métrico es recomendado para mayor precisión
          </Text>
          <Text style={styles.infoText}>
            • Las configuraciones se guardan automáticamente
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  optionTextSelected: {
    color: '#059669',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  optionDescriptionSelected: {
    color: '#047857',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e3a8a',
    lineHeight: 20,
    marginBottom: 8,
  },
});
