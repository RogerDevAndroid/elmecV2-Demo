import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSupabaseHealth } from '@/hooks/useSupabaseHealth';
import {
  CircleCheck as CheckCircle,
  CircleX as XCircle,
  RefreshCw,
  Wifi,
  Database,
  Zap,
  Shield,
} from 'lucide-react-native';

export const HealthCheck: React.FC = () => {
  const { health, checkHealth, isHealthy } = useSupabaseHealth();

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle size={16} color="#10b981" />
    ) : (
      <XCircle size={16} color="#ef4444" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? '#10b981' : '#ef4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estado del Sistema</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={checkHealth}>
          <RefreshCw size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusList}>
        <View style={styles.statusItem}>
          <Wifi size={20} color={getStatusColor(health.isConnected)} />
          <Text style={styles.statusLabel}>Conexión</Text>
          {getStatusIcon(health.isConnected)}
        </View>

        <View style={styles.statusItem}>
          <Shield size={20} color={getStatusColor(health.isAuthenticated)} />
          <Text style={styles.statusLabel}>Autenticación</Text>
          {getStatusIcon(health.isAuthenticated)}
        </View>

        <View style={styles.statusItem}>
          <Database
            size={20}
            color={getStatusColor(health.databaseAccessible)}
          />
          <Text style={styles.statusLabel}>Base de Datos</Text>
          {getStatusIcon(health.databaseAccessible)}
        </View>

        <View style={styles.statusItem}>
          <Zap size={20} color={getStatusColor(health.realtimeConnected)} />
          <Text style={styles.statusLabel}>Tiempo Real</Text>
          {getStatusIcon(health.realtimeConnected)}
        </View>
      </View>

      {health.errors.length > 0 && (
        <View style={styles.errorsContainer}>
          <Text style={styles.errorsTitle}>Errores detectados:</Text>
          {health.errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              • {error}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.lastChecked}>
        Última verificación: {health.lastChecked.toLocaleTimeString('es-ES')}
      </Text>

      <View
        style={[
          styles.overallStatus,
          { backgroundColor: isHealthy ? '#ecfdf5' : '#fef2f2' },
        ]}
      >
        <Text
          style={[
            styles.overallStatusText,
            { color: isHealthy ? '#059669' : '#dc2626' },
          ]}
        >
          {isHealthy
            ? '✅ Sistema funcionando correctamente'
            : '⚠️ Se detectaron problemas'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  refreshButton: {
    padding: 4,
  },
  statusList: {
    gap: 12,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  errorsContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#991b1b',
    marginBottom: 4,
  },
  lastChecked: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  overallStatus: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  overallStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
