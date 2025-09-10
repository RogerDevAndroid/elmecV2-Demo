import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings } from 'lucide-react-native';

interface HeaderComponentProps {
  theme?: string;
  showBackButton?: boolean;
  showSecondButton?: boolean;
  onSecondButtonPress?: () => void;
  icon?: any;
  title?: string;
}

export default function HeaderComponent({
  theme,
  showBackButton = false,
  showSecondButton = false,
  onSecondButtonPress,
  title,
}: HeaderComponentProps) {
  const router = useRouter();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? '#061831' : '#1e40af' },
      ]}
    >
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title || 'ELMEC'}</Text>

        {showSecondButton && (
          <TouchableOpacity
            onPress={onSecondButtonPress}
            style={styles.settingsButton}
          >
            <Settings size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
  },
});
