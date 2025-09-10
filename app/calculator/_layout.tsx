import { Stack } from 'expo-router';

export default function CalculatorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="CalculadoraScreen" />
      <Stack.Screen name="BarrenadoScreen" />
      <Stack.Screen name="FresadoScreen" />
      <Stack.Screen name="SettingsCalculadoraScreen" />
    </Stack>
  );
}
