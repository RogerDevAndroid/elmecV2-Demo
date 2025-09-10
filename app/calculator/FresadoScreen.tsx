import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CalculatorView } from '@/components/calculator/CalculatorView';
import HeaderComponent from '@/components/HeaderComponent';

export default function FresadoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        title="Fresado"
        showBackButton={true}
        showSecondButton={true}
        onSecondButtonPress={() =>
          router.push('/calculator/SettingsCalculadoraScreen' as any)
        }
      />
      <CalculatorView theme="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
