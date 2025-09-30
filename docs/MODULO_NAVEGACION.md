# 🧭 Módulo de Navegación - Documentación Técnica

## Visión General

ElmecV2 utiliza **Expo Router** para navegación basada en el sistema de archivos, proporcionando navegación type-safe y estructura intuitiva.

### Tecnologías
- **Expo Router 5.1**: Sistema de navegación
- **React Navigation 7**: Navegadores (tabs, stack)
- **Type-safe routing**: Rutas tipadas con TypeScript

---

## Estructura de Navegación

```
app/
├── _layout.tsx              → Root Layout (Stack Navigator)
│   ├── index.tsx           → Entry Point (Redirect)
│   ├── auth/               → Auth Stack
│   │   ├── _layout.tsx    → Auth Layout
│   │   ├── index.tsx      → Auth Landing
│   │   ├── login.tsx      → Login
│   │   └── register.tsx   → Register
│   │
│   ├── (tabs)/            → Main Tab Navigator
│   │   ├── _layout.tsx   → Tab Layout
│   │   ├── index.tsx     → Home (Solicitudes)
│   │   ├── requests.tsx  → Gestión Solicitudes
│   │   ├── chat/         → Chat Stack
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx      → Lista Chats
│   │   │   └── [roomId].tsx   → Sala de Chat
│   │   ├── directory.tsx → Directorio
│   │   ├── calculator.tsx → Calculadoras
│   │   └── profile.tsx   → Perfil
│   │
│   ├── calculator/        → Calculator Stack
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── FresadoScreen.tsx
│   │   └── BarrenadoScreen.tsx
│   │
│   └── +not-found.tsx    → 404 Page
```

---

## Root Layout

**Ubicación**: `app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import { ContextProviders } from '@/components/ContextProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ContextProviders>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ContextProviders>
      </Provider>
    </ErrorBoundary>
  );
}
```

---

## Entry Point con Protección

**Ubicación**: `app/index.tsx`

```tsx
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // No autenticado → Login
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Autenticado → App
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
```

---

## Tab Navigator

**Ubicación**: `app/(tabs)/_layout.tsx`

```tsx
import { Tabs } from 'expo-router';
import { Home, MessageSquare, Search, Calculator, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />

      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculadora',
          tabBarIcon: ({ color, size }) => (
            <Calculator size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="directory"
        options={{
          title: 'Directorio',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          // Ocultar para clientes
          href: user?.rol === 'customer' ? null : '/directory',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## Navegación Programática

### Router Hooks

```tsx
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();

  // Navegar a ruta
  router.push('/auth/login');

  // Reemplazar ruta actual
  router.replace('/(tabs)');

  // Volver atrás
  router.back();

  // Navegar con parámetros
  router.push({
    pathname: '/chat/[roomId]',
    params: { roomId: '123' },
  });

  // Leer parámetros
  const { roomId } = params;

  return null;
}
```

---

## Rutas Dinámicas

### Parámetros de Ruta

**Archivo**: `app/(tabs)/chat/[roomId].tsx`

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  return (
    <View>
      <Text>Chat Room: {roomId}</Text>
    </View>
  );
}
```

**Navegación**:
```tsx
router.push(`/chat/${roomId}`);
// o
router.push({ pathname: '/chat/[roomId]', params: { roomId } });
```

---

## Rutas Protegidas

### Middleware de Autenticación

```tsx
// app/(tabs)/_layout.tsx
export default function ProtectedTabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Tabs>{/* tabs */}</Tabs>;
}
```

---

## Rutas por Rol

### Condicional por Rol de Usuario

```tsx
<Tabs.Screen
  name="directory"
  options={{
    title: 'Directorio',
    href: user?.rol === 'customer' ? null : '/directory',
  }}
/>
```

---

## Deep Linking

### Configuración

**Archivo**: `app.json`

```json
{
  "expo": {
    "scheme": "elmec",
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://elmec-app.com"
        }
      ]
    ]
  }
}
```

### URLs Soportadas

```
// App
elmec://
elmec://auth/login
elmec://chat/room-123
elmec://requests/req-456

// Web
https://elmec-app.com/
https://elmec-app.com/auth/login
https://elmec-app.com/chat/room-123
```

---

## Type-Safe Navigation

### Rutas Tipadas

```tsx
import { Href } from 'expo-router';

// Tipo seguro
const route: Href = '/(tabs)/chat/[roomId]';

router.push(route);
```

### Tipos Automáticos

Expo Router genera tipos automáticamente:

```typescript
// Generado automáticamente
type Routes =
  | '/'
  | '/auth/login'
  | '/auth/register'
  | '/(tabs)'
  | '/(tabs)/chat/[roomId]'
  | '/calculator/FresadoScreen'
  // ... etc
```

---

## Layouts Anidados

### Stack dentro de Tab

```tsx
// app/(tabs)/chat/_layout.tsx
import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#3B82F6' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Conversaciones' }}
      />
      <Stack.Screen
        name="[roomId]"
        options={{ title: 'Chat' }}
      />
    </Stack>
  );
}
```

---

## Navegación con Estado

### Pasar Datos entre Pantallas

**Opción 1: Query Params**
```tsx
router.push({
  pathname: '/details',
  params: { id: '123', name: 'Juan' },
});

// En la pantalla destino
const { id, name } = useLocalSearchParams();
```

**Opción 2: Context/Redux**
```tsx
// Guardar en context
dispatch(setSelectedRequest(request));

// Navegar
router.push('/request-details');

// Leer en destino
const selectedRequest = useSelector(state => state.requests.selected);
```

---

## Casos de Uso

### Caso 1: Login → App

```tsx
// En LoginScreen
const handleLogin = async () => {
  const success = await login(email, password);
  if (success) {
    router.replace('/(tabs)'); // replace para no poder volver con back
  }
};
```

---

### Caso 2: Logout → Login

```tsx
const handleLogout = async () => {
  await logout();
  router.replace('/auth/login');
};
```

---

### Caso 3: Abrir Chat desde Notificación

```tsx
const handleNotificationPress = (notification) => {
  const { roomId } = notification.data;

  if (roomId) {
    router.push(`/(tabs)/chat/${roomId}`);
  }
};
```

---

### Caso 4: Navegación Condicional

```tsx
const handleRequestPress = (request) => {
  if (request.has_chat) {
    router.push(`/(tabs)/chat/${request.chat_room_id}`);
  } else {
    router.push({
      pathname: '/request-details',
      params: { id: request.id },
    });
  }
};
```

---

## Mejores Prácticas

1. **Usar `replace` para flujos de autenticación**
2. **Usar `push` para navegación normal**
3. **Validar autenticación en layouts**
4. **Mantener estructura de carpetas clara**
5. **Usar rutas tipadas siempre que sea posible**
6. **Limpiar estado al desmontar (si necesario)**
7. **Usar deep linking para mejor UX**

---

**Última Actualización**: 30 de Septiembre, 2025