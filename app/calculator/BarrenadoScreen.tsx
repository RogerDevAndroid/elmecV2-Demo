import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BarrenadoView } from '@/components/calculator/BarrenadoView';
import HeaderComponent from '@/components/HeaderComponent';

export default function BarrenadoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        title="Barrenado"
        showBackButton={true}
        showSecondButton={true}
        onSecondButtonPress={() =>
          router.push('/calculator/SettingsCalculadoraScreen' as any)
        }
      />
      <BarrenadoView theme="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
