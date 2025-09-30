# 🔄 Módulo de Contextos y Estado - Documentación Técnica

## Visión General

ElmecV2 utiliza una arquitectura híbrida de gestión de estado:
- **React Context API** para estado global de autenticación, chat y notificaciones
- **Redux Toolkit** para estado de la calculadora
- **Estado Local** para UI específica de componentes

---

## Arquitectura de Estado

```
┌──────────────────────────────────────────────────────────┐
│                    Redux Store                           │
│  - calculator (Redux Toolkit)                            │
│    - Configuraciones                                     │
│    - Historial                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  Context Providers                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │  AuthContext                                       │ │
│  │  - user, session, isAuthenticated                 │ │
│  │  - login(), register(), logout()                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ChatContext                                       │ │
│  │  - chatRooms, messages, typingUsers               │ │
│  │  - sendMessage(), createChatRoom()                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  NotificationContext                               │ │
│  │  - notifications                                   │ │
│  │  - sendNotification(), clearNotifications()       │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Context API

### 1. AuthContext

**Ubicación**: `contexts/AuthContext.tsx`

**Propósito**: Gestión global de autenticación y usuario.

#### Estado
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
}
```

#### API
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegistrationData) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

#### Uso
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Bienvenido {user?.nombre}</Text>
      <Button onPress={logout} title="Cerrar Sesión" />
    </View>
  );
}
```

#### Implementación Clave

**Inicialización**:
```typescript
useEffect(() => {
  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
  };

  initializeAuth();

  // Escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**Cargar Perfil**:
```typescript
const loadUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error loading profile:', error);
    return;
  }

  setUser(data);

  // Actualizar estado online
  await supabase
    .from('users')
    .update({
      is_online: true,
      last_login: new Date().toISOString(),
    })
    .eq('id', userId);
};
```

---

### 2. ChatContext

**Ubicación**: `contexts/ChatContext.tsx`

**Propósito**: Gestión de chat en tiempo real.

#### Estado
```typescript
interface ChatState {
  chatRooms: ChatRoom[];
  messages: { [roomId: string]: ChatMessage[] };
  typingUsers: { [roomId: string]: TypingUser[] };
  loading: boolean;
  error: string | null;
}
```

#### API
```typescript
interface ChatContextType extends ChatState {
  sendMessage: (
    roomId: string,
    message: string,
    messageType?: Message['type'],
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    audioDuration?: number,
    replyTo?: string
  ) => Promise<void>;

  sendTypingIndicator: (roomId: string, isTyping: boolean) => void;

  createChatRoom: (
    participantId: string,
    participantName: string,
    requestId?: string
  ) => Promise<string>;

  markMessagesAsRead: (roomId: string) => Promise<void>;

  getChatRoom: (roomId: string) => ChatRoom | undefined;
  getUnreadCount: () => number;
  getRoomUnreadCount: (roomId: string) => number;

  loadMoreMessages: (roomId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newMessage: string) => Promise<void>;
}
```

#### Uso
```tsx
import { useChat } from '@/contexts/ChatContext';

function ChatScreen({ roomId }: { roomId: string }) {
  const {
    messages,
    sendMessage,
    typingUsers,
    sendTypingIndicator,
    markMessagesAsRead,
  } = useChat();

  const roomMessages = messages[roomId] || [];
  const typing = typingUsers[roomId] || [];

  useEffect(() => {
    // Marcar como leído al abrir
    markMessagesAsRead(roomId);
  }, [roomId]);

  const handleSend = (text: string) => {
    sendMessage(roomId, text);
  };

  return (
    <View>
      <FlatList
        data={roomMessages}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      {typing.length > 0 && <TypingIndicator users={typing} />}

      <MessageInput
        onSend={handleSend}
        onTyping={(isTyping) => sendTypingIndicator(roomId, isTyping)}
      />
    </View>
  );
}
```

#### Realtime Subscriptions

```typescript
const setupRealtimeSubscription = (roomId: string) => {
  const channel = supabase
    .channel(`chat_room_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${roomId}`,
      },
      async (payload) => {
        const newMessage = payload.new as Message;

        // Obtener info del usuario
        const { data: userData } = await supabase
          .from('users')
          .select('nombre, apellido_paterno, foto')
          .eq('id', newMessage.sender_id)
          .single();

        // Agregar mensaje al estado
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), {
            ...newMessage,
            user: userData,
            isDelivered: true,
          }],
        }));

        // Notificar si no es mensaje propio
        if (newMessage.sender_id !== user?.id) {
          sendNotification(
            `💬 ${newMessage.sender_name}`,
            newMessage.message
          );
        }
      }
    )
    .subscribe();

  setRealtimeChannels(prev => ({ ...prev, [roomId]: channel }));
};
```

---

### 3. NotificationContext

**Ubicación**: `contexts/NotificationContext.tsx`

**Propósito**: Sistema de notificaciones de la app.

#### Estado
```typescript
interface NotificationState {
  notifications: Notification[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  data?: any;
}
```

#### API
```typescript
interface NotificationContextType {
  notifications: Notification[];

  sendDemoNotification: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error',
    data?: any
  ) => Promise<void>;

  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}
```

#### Uso
```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { sendDemoNotification } = useNotifications();

  const handleSuccess = () => {
    sendDemoNotification(
      'Éxito',
      'Operación completada correctamente',
      'success'
    );
  };

  const handleError = () => {
    sendDemoNotification(
      'Error',
      'Algo salió mal',
      'error'
    );
  };

  return (
    <View>
      <Button onPress={handleSuccess} title="Mostrar Éxito" />
      <Button onPress={handleError} title="Mostrar Error" />
    </View>
  );
}
```

#### Implementación

```typescript
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sendDemoNotification = async (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    data?: any
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      duration: 3000,
      data,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove después de duration
    setTimeout(() => {
      clearNotification(notification.id);
    }, notification.duration);

    // Haptic feedback
    if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        sendDemoNotification,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}

      {/* Renderizar notificaciones */}
      <View style={styles.notificationContainer}>
        {notifications.map(notif => (
          <NotificationToast
            key={notif.id}
            message={notif.message}
            type={notif.type}
            onDismiss={() => clearNotification(notif.id)}
          />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};
```

---

## Redux Toolkit

### Store Configuration

**Ubicación**: `store/index.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import calculatorReducer from './calculatorSlice';

export const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### Calculator Slice

**Ubicación**: `store/calculatorSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CalculatorState {
  selectedMaterial: string;
  configurations: Configuration[];
  history: Calculation[];
}

interface Configuration {
  id: string;
  name: string;
  material: string;
  parameters: any;
}

interface Calculation {
  id: string;
  tipo: 'fresado' | 'barrenado';
  operacion: string;
  material: string;
  inputs: any;
  resultados: any;
  timestamp: number;
}

const initialState: CalculatorState = {
  selectedMaterial: 'acero_medio',
  configurations: [],
  history: [],
};

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setSelectedMaterial: (state, action: PayloadAction<string>) => {
      state.selectedMaterial = action.payload;
    },

    addCalculation: (state, action: PayloadAction<Omit<Calculation, 'id'>>) => {
      state.history.unshift({
        ...action.payload,
        id: `calc-${Date.now()}`,
      });

      // Limitar historial a 50 cálculos
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },

    saveConfiguration: (state, action: PayloadAction<Omit<Configuration, 'id'>>) => {
      state.configurations.push({
        ...action.payload,
        id: `config-${Date.now()}`,
      });
    },

    deleteConfiguration: (state, action: PayloadAction<string>) => {
      state.configurations = state.configurations.filter(
        c => c.id !== action.payload
      );
    },

    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const {
  setSelectedMaterial,
  addCalculation,
  saveConfiguration,
  deleteConfiguration,
  clearHistory,
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
```

#### Uso

```tsx
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addCalculation, setSelectedMaterial } from '@/store/calculatorSlice';

function CalculatorScreen() {
  const dispatch = useDispatch();

  const selectedMaterial = useSelector(
    (state: RootState) => state.calculator.selectedMaterial
  );

  const history = useSelector(
    (state: RootState) => state.calculator.history
  );

  const handleMaterialChange = (material: string) => {
    dispatch(setSelectedMaterial(material));
  };

  const handleCalculation = (inputs: any, resultados: any) => {
    dispatch(addCalculation({
      tipo: 'fresado',
      operacion: 'cilindrado',
      material: selectedMaterial,
      inputs,
      resultados,
      timestamp: Date.now(),
    }));
  };

  return (
    <View>
      <MaterialPicker
        value={selectedMaterial}
        onChange={handleMaterialChange}
      />

      {/* Historial */}
      <FlatList
        data={history}
        renderItem={({ item }) => <CalculationItem calculation={item} />}
      />
    </View>
  );
}
```

---

## ContextProviders Wrapper

**Ubicación**: `components/ContextProviders.tsx`

```typescript
export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

**Uso en Root Layout**:
```tsx
// app/_layout.tsx
export default function RootLayout() {
  return (
    <Provider store={store}>
      <ContextProviders>
        <Stack />
      </ContextProviders>
    </Provider>
  );
}
```

---

## Custom Hooks

### useSupabaseHealth

**Ubicación**: `hooks/useSupabaseHealth.ts`

```typescript
export function useSupabaseHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      setIsHealthy(!error);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Cada 30s
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, lastCheck, checking, checkHealth };
}
```

---

### useFrameworkReady

**Ubicación**: `hooks/useFrameworkReady.ts`

```typescript
export function useFrameworkReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Inicializar servicios
        await Promise.all([
          // Cargar fuentes
          // Inicializar i18n
          // Verificar conexión
        ]);

        setReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  return ready;
}
```

---

## Flujo de Datos Completo

### Ejemplo: Enviar Mensaje en Chat

```
1. Usuario escribe mensaje
   ↓
2. Component llama sendMessage() de ChatContext
   ↓
3. ChatContext:
   - Agrega mensaje local (optimistic update)
   - INSERT en tabla messages (Supabase)
   ↓
4. Supabase Realtime dispara evento
   ↓
5. Todos los clientes suscritos reciben el evento
   ↓
6. ChatContext actualiza estado con mensaje real
   ↓
7. NotificationContext envía notificación a otros usuarios
   ↓
8. Components se re-renderizan con nuevo estado
```

---

## Mejores Prácticas

### 1. Context API
- Usar Context para estado verdaderamente global
- No abusar de Context (evitar re-renders innecesarios)
- Dividir en múltiples contexts por dominio
- Usar custom hooks para acceder a contexts

### 2. Redux
- Usar para estado complejo o que requiere persistencia
- Normalizar estado cuando sea necesario
- Usar Redux Toolkit (no Redux vanilla)
- Crear slices por feature

### 3. Estado Local
- Preferir estado local cuando sea posible
- Usar useState para UI simple
- Usar useReducer para lógica compleja

### 4. Optimización
```tsx
// Memoizar selectores
const selectedData = useSelector(selectComplexData, shallowEqual);

// Memoizar componentes
const MemoizedComponent = React.memo(MyComponent);

// Memoizar callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Memoizar valores computados
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### 5. Limpieza
```tsx
useEffect(() => {
  const subscription = supabase
    .channel('room')
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Debugging

### Redux DevTools

```typescript
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
  },
  devTools: __DEV__, // Solo en desarrollo
});
```

### Context Debugging

```typescript
// Exponer en window para debugging
useEffect(() => {
  if (__DEV__) {
    (window as any).AuthContext = {
      user,
      isAuthenticated,
      session,
    };
  }
}, [user, isAuthenticated, session]);
```

---

## Troubleshooting

### Problema: Re-renders excesivos

**Causa**: Context cambia muy frecuentemente

**Solución**:
```tsx
// Dividir context en múltiples contexts
const UserContext = createContext();
const SessionContext = createContext();

// O usar useMemo para valores
const value = useMemo(() => ({
  user,
  isAuthenticated,
  login,
}), [user, isAuthenticated]); // No incluir funciones
```

---

### Problema: Estado no se actualiza

**Causa**: Mutación directa del estado

**Solución**:
```tsx
// ❌ Incorrecto
state.users.push(newUser);

// ✅ Correcto
setState(prev => ({
  ...prev,
  users: [...prev.users, newUser],
}));
```

---

**Última Actualización**: 30 de Septiembre, 2025
**Versión**: 2.0.0