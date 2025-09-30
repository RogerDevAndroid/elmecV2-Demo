# 🎨 Módulo de Componentes UI - Documentación Técnica

## Visión General

Este módulo contiene todos los componentes reutilizables de la interfaz de usuario, organizados por funcionalidad y propósito.

---

## Componentes Principales

### 1. ErrorBoundary

**Ubicación**: `components/ErrorBoundary.tsx`

**Propósito**: Captura errores de React y muestra UI de fallback.

```tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Aquí puedes enviar a servicio de error tracking
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View style={styles.container}>
            <Text style={styles.title}>Algo salió mal</Text>
            <Text>{this.state.error?.message}</Text>
            <Button
              title="Reintentar"
              onPress={() => this.setState({ hasError: false, error: null })}
            />
          </View>
        )
      );
    }

    return this.props.children;
  }
}
```

---

### 2. NotificationToast

**Ubicación**: `components/NotificationToast.tsx`

**Propósito**: Mostrar notificaciones toast temporales.

```tsx
interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
}

export function NotificationToast({ message, type, duration = 3000, onDismiss }: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const backgroundColor = {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, opacity: fadeAnim },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}
```

---

### 3. MessageBubble

**Ubicación**: `components/MessageBubble.tsx`

**Propósito**: Renderizar burbujas de mensaje en el chat.

```tsx
interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onReply?: () => void;
}

export function MessageBubble({
  message,
  isOwnMessage,
  onLongPress,
  onReply,
}: MessageBubbleProps) {
  return (
    <Pressable
      onLongPress={onLongPress}
      style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
      ]}
    >
      {/* Avatar (si no es mensaje propio) */}
      {!isOwnMessage && (
        <Image source={{ uri: message.user?.foto }} style={styles.avatar} />
      )}

      <View style={styles.content}>
        {/* Nombre del remitente */}
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.sender_name}</Text>
        )}

        {/* Mensaje respondido */}
        {message.reply_to && <ReplyPreview messageId={message.reply_to} />}

        {/* Contenido del mensaje */}
        {renderMessageContent(message)}

        {/* Footer con timestamp y estados */}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {formatTime(message.created_at)}
          </Text>

          {message.edited_at && (
            <Text style={styles.edited}>editado</Text>
          )}

          {isOwnMessage && (
            <MessageStatus
              isDelivered={message.isDelivered}
              isRead={message.isRead}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function renderMessageContent(message: ChatMessage) {
  switch (message.type) {
    case 'text':
      return <Text style={styles.text}>{message.message}</Text>;

    case 'image':
      return (
        <View>
          <Image
            source={{ uri: message.file_url }}
            style={styles.image}
            resizeMode="cover"
          />
          {message.message && <Text>{message.message}</Text>}
        </View>
      );

    case 'audio':
      return <AudioPlayer uri={message.file_url} duration={message.audio_duration} />;

    case 'file':
      return (
        <View style={styles.file}>
          <FileIcon />
          <Text>{message.file_name}</Text>
          <Text>{formatFileSize(message.file_size)}</Text>
        </View>
      );

    default:
      return <Text>{message.message}</Text>;
  }
}
```

---

### 4. TypingIndicator

**Ubicación**: `components/TypingIndicator.tsx`

**Propósito**: Mostrar indicador de "escribiendo...".

```tsx
interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map(u => u.userName).join(', ');
  const text = users.length > 1 ? 'están escribiendo' : 'está escribiendo';

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {names} {text}
        </Text>
        <AnimatedDots />
      </View>
    </View>
  );
}

function AnimatedDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: -10, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot2, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot3, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => animate());
      }, 400);
    };

    animate();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
}
```

---

### 5. EmojiPicker

**Ubicación**: `components/EmojiPicker.tsx`

**Propósito**: Selector de emojis para el chat.

```tsx
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  visible: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
  food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🥤', '🍦', '🍰'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸'],
};

export function EmojiPicker({ onEmojiSelect, visible, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState('smileys');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Seleccionar Emoji</Text>
          <TouchableOpacity onPress={onClose}>
            <Text>Cerrar</Text>
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <ScrollView horizontal style={styles.categories}>
          {Object.keys(EMOJI_CATEGORIES).map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
            >
              <Text>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Emojis */}
        <ScrollView contentContainerStyle={styles.emojiGrid}>
          {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              style={styles.emojiButton}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
```

---

### 6. FileUploadComponent

**Ubicación**: `components/FileUploadComponent.tsx`

**Propósito**: Subir archivos, imágenes y audio.

```tsx
interface FileUploadComponentProps {
  onFileSelect: (file: FileUploadResult) => void;
  acceptedTypes?: ('image' | 'document' | 'audio')[];
}

export function FileUploadComponent({
  onFileSelect,
  acceptedTypes = ['image', 'document', 'audio'],
}: FileUploadComponentProps) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadFile(result.assets[0], 'image');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      await uploadFile(result, 'document');
    }
  };

  const recordAudio = async () => {
    // Implementar grabación de audio
  };

  const uploadFile = async (file: any, type: string) => {
    setUploading(true);

    try {
      // Subir a Supabase Storage
      const fileName = `${Date.now()}-${file.name || 'file'}`;
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      onFileSelect({
        id: fileName,
        url: publicUrl,
        fileName: file.name,
        size: file.size,
        mimeType: file.mimeType || file.type,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {acceptedTypes.includes('image') && (
        <TouchableOpacity onPress={pickImage} style={styles.button}>
          <Text>📷 Imagen</Text>
        </TouchableOpacity>
      )}

      {acceptedTypes.includes('document') && (
        <TouchableOpacity onPress={pickDocument} style={styles.button}>
          <Text>📎 Documento</Text>
        </TouchableOpacity>
      )}

      {acceptedTypes.includes('audio') && (
        <TouchableOpacity onPress={recordAudio} style={styles.button}>
          <Text>🎤 Audio</Text>
        </TouchableOpacity>
      )}

      {uploading && <ActivityIndicator />}
    </View>
  );
}
```

---

### 7. HeaderComponent

**Ubicación**: `components/HeaderComponent.tsx`

**Propósito**: Header personalizado para pantallas.

```tsx
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export function HeaderComponent({
  title,
  showBack = false,
  onBack,
  rightComponent,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {/* Botón atrás */}
      {showBack && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
      )}

      {/* Título */}
      <Text style={styles.title}>{title}</Text>

      {/* Componente derecho */}
      {rightComponent && (
        <View style={styles.rightComponent}>{rightComponent}</View>
      )}
    </View>
  );
}
```

---

### 8. AdminDashboard

**Ubicación**: `components/AdminDashboard.tsx`

**Propósito**: Dashboard para administradores con métricas.

```tsx
export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    resolvedRequests: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Cargar estadísticas desde Supabase
    const [requests, users] = await Promise.all([
      supabase.from('requests').select('*', { count: 'exact' }),
      supabase.from('users').select('*', { count: 'exact' }),
    ]);

    setStats({
      totalRequests: requests.count || 0,
      activeRequests: requests.data?.filter(r => r.estatus === 'en_proceso').length || 0,
      resolvedRequests: requests.data?.filter(r => r.estatus === 'resuelto').length || 0,
      totalUsers: users.count || 0,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard Administrativo</Text>

      {/* Tarjetas de métricas */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Solicitudes"
          value={stats.totalRequests}
          icon="📋"
          color="#3B82F6"
        />
        <StatCard
          title="Activas"
          value={stats.activeRequests}
          icon="⚡"
          color="#F59E0B"
        />
        <StatCard
          title="Resueltas"
          value={stats.resolvedRequests}
          icon="✅"
          color="#10B981"
        />
        <StatCard
          title="Usuarios"
          value={stats.totalUsers}
          icon="👥"
          color="#8B5CF6"
        />
      </View>

      {/* Gráficos */}
      <View style={styles.charts}>
        <Text style={styles.subtitle}>Solicitudes por Estado</Text>
        {/* Implementar gráfico */}
      </View>

      {/* Lista reciente */}
      <RecentRequestsList />
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}
```

---

### 9. AdvancedSearchComponent

**Ubicación**: `components/AdvancedSearchComponent.tsx`

**Propósito**: Búsqueda y filtrado avanzado de solicitudes.

```tsx
interface SearchFilters {
  query: string;
  status?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
  assignedTo?: string;
}

export function AdvancedSearchComponent({ onSearch }: { onSearch: (filters: SearchFilters) => void }) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <View style={styles.container}>
      {/* Búsqueda por texto */}
      <TextInput
        placeholder="Buscar..."
        value={filters.query}
        onChangeText={(text) => setFilters({ ...filters, query: text })}
        style={styles.searchInput}
      />

      {/* Filtros */}
      <View style={styles.filters}>
        {/* Estado */}
        <Picker
          selectedValue={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <Picker.Item label="Todos los estados" value="" />
          <Picker.Item label="Pendiente" value="pendiente" />
          <Picker.Item label="En Proceso" value="en_proceso" />
          <Picker.Item label="Resuelto" value="resuelto" />
        </Picker>

        {/* Prioridad */}
        <Picker
          selectedValue={filters.priority}
          onValueChange={(value) => setFilters({ ...filters, priority: value })}
        >
          <Picker.Item label="Todas las prioridades" value="" />
          <Picker.Item label="Baja" value="baja" />
          <Picker.Item label="Media" value="media" />
          <Picker.Item label="Alta" value="alta" />
          <Picker.Item label="Urgente" value="urgente" />
        </Picker>
      </View>

      <Button title="Buscar" onPress={handleSearch} />
    </View>
  );
}
```

---

### 10. HealthCheck

**Ubicación**: `components/HealthCheck.tsx`

**Propósito**: Verificar estado de conexión con backend.

```tsx
export function HealthCheck() {
  const { isHealthy, lastCheck, checking } = useSupabaseHealth();

  if (isHealthy) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        ⚠️ Problemas de conexión con el servidor
      </Text>
      {checking && <ActivityIndicator size="small" color="#fff" />}
    </View>
  );
}
```

---

## Componentes de Utilidad

### LoadingSpinner

```tsx
export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'large' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#3B82F6" />
    </View>
  );
}
```

### EmptyState

```tsx
interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <Button title={action.label} onPress={action.onPress} />
      )}
    </View>
  );
}
```

---

## Mejores Prácticas

1. **Componentes pequeños y enfocados**
2. **Usar TypeScript para props**
3. **Memoización con React.memo cuando sea necesario**
4. **Estilos con StyleSheet**
5. **Accesibilidad (accessibilityLabel, etc.)**
6. **Loading y error states**
7. **Responsive design**

---

**Última Actualización**: 30 de Septiembre, 2025