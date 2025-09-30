# 🔐 Módulo de Autenticación - Documentación Técnica

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Flujos de Autenticación](#flujos-de-autenticación)
4. [Componentes](#componentes)
5. [API y Métodos](#api-y-métodos)
6. [Seguridad](#seguridad)
7. [Gestión de Estado](#gestión-de-estado)
8. [Casos de Uso](#casos-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Visión General

### Descripción
El módulo de autenticación de ElmecV2 es el sistema central de gestión de identidad y acceso. Proporciona autenticación segura, gestión de sesiones, y control de roles para todos los usuarios del sistema.

### Características Principales
- ✅ Autenticación con email y contraseña
- ✅ Registro de nuevos usuarios
- ✅ Gestión de sesiones persistentes
- ✅ Refresh automático de tokens JWT
- ✅ Sistema de roles (customer, agent, admin)
- ✅ Perfiles de usuario completos
- ✅ Estados de presencia (online/offline)
- ✅ Row Level Security (RLS)
- ✅ Logout con limpieza de sesión

### Tecnologías Utilizadas
- **Supabase Auth**: Sistema de autenticación backend
- **JWT Tokens**: Tokens de sesión
- **React Context API**: Gestión de estado global
- **AsyncStorage**: Persistencia local de sesión
- **TypeScript**: Tipado fuerte

---

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthContext Provider                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Estado Global                                        │  │
│  │  - user: User | null                                  │  │
│  │  - session: Session | null                            │  │
│  │  - isAuthenticated: boolean                          │  │
│  │  - loading: boolean                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Métodos                                              │  │
│  │  - login(email, password)                            │  │
│  │  - register(userData)                                │  │
│  │  - logout()                                          │  │
│  │  - loadUserProfile(userId)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Auth                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - signInWithPassword()                               │  │
│  │  - signUp()                                           │  │
│  │  - signOut()                                          │  │
│  │  - getSession()                                       │  │
│  │  - onAuthStateChange()                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tabla: auth.users (Supabase managed)                │  │
│  │  Tabla: public.users (Perfiles de usuario)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario Ingresa Credenciales
         ↓
  Login Screen (UI)
         ↓
  AuthContext.login()
         ↓
  Supabase.auth.signInWithPassword()
         ↓
  JWT Token Generado
         ↓
  loadUserProfile()
         ↓
  Query a tabla 'users'
         ↓
  Estado Actualizado (user, session)
         ↓
  Navegación a App Principal
```

---

## Flujos de Autenticación

### 1. Flujo de Login

#### Paso a Paso

**Paso 1**: Usuario ingresa email y contraseña
```tsx
// app/auth/login.tsx
const handleLogin = async () => {
  await login(email, password);
};
```

**Paso 2**: AuthContext valida y llama a Supabase
```tsx
// contexts/AuthContext.tsx
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.user) {
    await loadUserProfile(data.user.id);
  }
};
```

**Paso 3**: Se carga el perfil del usuario
```tsx
const loadUserProfile = async (userId: string) => {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  setUser(data);

  // Actualizar estado online
  await supabase
    .from('users')
    .update({
      is_online: true,
      last_login: new Date().toISOString()
    })
    .eq('id', userId);
};
```

**Paso 4**: Usuario autenticado, redirige a app

#### Diagrama de Secuencia

```
Usuario          LoginScreen       AuthContext       Supabase        Database
  │                   │                 │                │               │
  │──Ingresa datos───>│                 │                │               │
  │                   │──login()───────>│                │               │
  │                   │                 │──signIn()─────>│               │
  │                   │                 │                │──Valida───────>│
  │                   │                 │                │<─Auth OK──────│
  │                   │                 │<──Token────────│               │
  │                   │                 │──loadProfile()─────────────────>│
  │                   │                 │<──User Data────────────────────│
  │                   │<─Success────────│                │               │
  │<──Navigate to App─│                 │                │               │
```

---

### 2. Flujo de Registro

#### Paso a Paso

**Paso 1**: Usuario completa formulario de registro
```tsx
// app/auth/register.tsx
const userData = {
  nombre: 'Juan',
  apellido_paterno: 'Pérez',
  correo_electronico: 'juan@example.com',
  password: 'SecurePassword123',
  empresa: 'Mi Empresa',
  celular: '1234567890',
  // ... más campos
};

await register(userData);
```

**Paso 2**: AuthContext crea usuario en Supabase Auth
```tsx
// contexts/AuthContext.tsx
const register = async (userData) => {
  // 1. Crear usuario en auth
  const { data: authData } = await supabase.auth.signUp({
    email: userData.correo_electronico,
    password: userData.password,
  });

  // 2. Crear perfil en tabla users
  if (authData.user) {
    const profileData = {
      id: authData.user.id,
      email: authData.user.email,
      nombre: userData.nombre,
      apellido_paterno: userData.apellido_paterno,
      rol: 'customer',
      activo: true,
      // ... más campos
    };

    await supabase.from('users').insert(profileData);
  }
};
```

**Paso 3**: Usuario registrado y autenticado automáticamente

#### Campos Requeridos

```typescript
interface RegistrationData {
  // Obligatorios
  nombre: string;
  apellido_paterno: string;
  correo_electronico: string;
  password: string;

  // Opcionales
  apellido_materno?: string;
  empresa?: string;
  celular?: string;
  ciudad?: string;
  estado?: string;
}
```

---

### 3. Flujo de Logout

#### Paso a Paso

**Paso 1**: Usuario presiona "Cerrar Sesión"

**Paso 2**: AuthContext actualiza estado del usuario
```tsx
const logout = async () => {
  // 1. Actualizar estado a offline
  if (user) {
    await supabase
      .from('users')
      .update({
        is_online: false,
        last_seen: new Date().toISOString()
      })
      .eq('id', user.id);
  }

  // 2. Cerrar sesión en Supabase
  await supabase.auth.signOut();

  // 3. Limpiar estado local
  setSession(null);
  setUser(null);
};
```

**Paso 3**: Redirige a pantalla de login

---

### 4. Flujo de Recuperación de Sesión

#### Al Iniciar la App

```tsx
useEffect(() => {
  const initializeAuth = async () => {
    // 1. Obtener sesión guardada
    const { data: { session } } = await supabase.auth.getSession();

    // 2. Si existe sesión, cargar perfil
    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
  };

  initializeAuth();

  // 3. Escuchar cambios de autenticación
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

---

## Componentes

### 1. AuthContext.tsx

**Ubicación**: `contexts/AuthContext.tsx`

**Responsabilidades**:
- Gestionar estado de autenticación global
- Proveer métodos de login/register/logout
- Mantener información del usuario actual
- Manejar sesión y tokens

#### Interface Principal

```typescript
interface AuthContextType {
  isAuthenticated: boolean;      // Estado de autenticación
  user: User | null;              // Usuario actual
  session: Session | null;        // Sesión de Supabase
  loading: boolean;               // Estado de carga

  // Métodos
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegistrationData) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

#### Uso en Componentes

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Text>No autenticado</Text>;
  }

  return (
    <View>
      <Text>Bienvenido {user?.nombre}</Text>
      <Button onPress={logout} title="Cerrar Sesión" />
    </View>
  );
}
```

---

### 2. Pantalla de Login

**Ubicación**: `app/auth/login.tsx`

**Funcionalidades**:
- Formulario de email y contraseña
- Validación en tiempo real
- Manejo de errores
- Navegación a registro
- Link de recuperación de contraseña

#### Estructura

```tsx
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Validaciones
      if (!email || !password) {
        setError('Completa todos los campos');
        return;
      }

      // Login
      const success = await login(email, password);

      if (success) {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <Button
        title="Iniciar Sesión"
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 3. Pantalla de Registro

**Ubicación**: `app/auth/register.tsx`

**Funcionalidades**:
- Formulario completo de registro
- Validación de campos
- Validación de contraseña fuerte
- Términos y condiciones
- Navegación a login

#### Validaciones

```tsx
const validateForm = () => {
  const errors = [];

  // Email válido
  if (!isValidEmail(email)) {
    errors.push('Email inválido');
  }

  // Contraseña fuerte
  if (password.length < 8) {
    errors.push('Contraseña debe tener al menos 8 caracteres');
  }

  // Contraseñas coinciden
  if (password !== confirmPassword) {
    errors.push('Las contraseñas no coinciden');
  }

  // Campos requeridos
  if (!nombre || !apellido_paterno) {
    errors.push('Nombre y apellido son requeridos');
  }

  return errors;
};
```

---

## API y Métodos

### AuthContext API

#### `login(email: string, password: string): Promise<boolean>`

Autentica un usuario con email y contraseña.

**Parámetros**:
- `email`: Email del usuario
- `password`: Contraseña del usuario

**Retorna**: `Promise<boolean>` - true si login exitoso

**Errores**:
- `invalid_credentials`: Credenciales incorrectas
- `user_not_found`: Usuario no existe
- `network_error`: Error de conexión

**Ejemplo**:
```tsx
try {
  const success = await login('user@example.com', 'password123');
  if (success) {
    console.log('Login exitoso');
  }
} catch (error) {
  console.error('Error:', error);
}
```

---

#### `register(userData: RegistrationData): Promise<boolean>`

Registra un nuevo usuario en el sistema.

**Parámetros**:
```typescript
interface RegistrationData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  correo_electronico: string;
  password: string;
  empresa?: string;
  celular?: string;
  ciudad?: string;
  estado?: string;
}
```

**Retorna**: `Promise<boolean>` - true si registro exitoso

**Ejemplo**:
```tsx
const userData = {
  nombre: 'Juan',
  apellido_paterno: 'Pérez',
  correo_electronico: 'juan@example.com',
  password: 'SecurePass123',
  empresa: 'Mi Empresa',
};

const success = await register(userData);
```

---

#### `logout(): Promise<void>`

Cierra la sesión del usuario actual.

**Acciones**:
1. Actualiza usuario a offline en BD
2. Cierra sesión en Supabase
3. Limpia estado local
4. Redirige a login

**Ejemplo**:
```tsx
await logout();
// Usuario deslogueado
```

---

### Supabase Auth API

#### Métodos Disponibles

```typescript
// Obtener sesión actual
const { data: { session } } = await supabase.auth.getSession();

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Registro
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Logout
await supabase.auth.signOut();

// Refresh token
const { data, error } = await supabase.auth.refreshSession();

// Escuchar cambios
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

---

## Seguridad

### 1. Row Level Security (RLS)

#### Políticas Implementadas

**Tabla `users`**:

```sql
-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND rol = 'admin'
  )
);
```

---

### 2. Validación de Contraseñas

#### Requisitos Mínimos

```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
};

function validatePassword(password: string): boolean {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return false;
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    return false;
  }

  return true;
}
```

---

### 3. Tokens JWT

#### Estructura del Token

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "full_name": "Juan Pérez"
  }
}
```

#### Refresh Automático

```typescript
// Configuración en lib/supabase.ts
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,     // Refresh automático
    persistSession: true,        // Guardar sesión
    detectSessionInUrl: false,   // No detectar en URL
  },
});
```

---

### 4. Protección de Rutas

#### Middleware de Autenticación

```tsx
// app/_layout.tsx
export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirigir a login
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirigir a app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return <Stack />;
}
```

---

## Gestión de Estado

### Estado Global del Contexto

```typescript
interface AuthState {
  // Estado de autenticación
  isAuthenticated: boolean;

  // Usuario actual
  user: User | null;

  // Sesión de Supabase
  session: Session | null;

  // Loading states
  loading: boolean;
}
```

### Persistencia de Sesión

La sesión se persiste automáticamente en:
- **Web**: `localStorage`
- **Mobile**: `AsyncStorage`

```typescript
// Configuración en lib/supabase.ts
{
  auth: {
    storage: typeof window !== 'undefined'
      ? window.localStorage
      : undefined,
  }
}
```

---

## Casos de Uso

### Caso 1: Proteger una Pantalla

```tsx
import { useAuth } from '@/contexts/AuthContext';

function ProtectedScreen() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!isAuthenticated) {
    return <Text>Acceso denegado</Text>;
  }

  return (
    <View>
      <Text>Contenido protegido para {user?.nombre}</Text>
    </View>
  );
}
```

---

### Caso 2: Verificar Rol de Usuario

```tsx
function AdminOnlyFeature() {
  const { user } = useAuth();

  if (user?.rol !== 'admin') {
    return <Text>Acceso solo para administradores</Text>;
  }

  return <AdminDashboard />;
}
```

---

### Caso 3: Actualizar Perfil de Usuario

```tsx
async function updateUserProfile(updates: Partial<User>) {
  const { user } = useAuth();

  if (!user) return;

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (!error) {
    // Recargar perfil
    await loadUserProfile(user.id);
  }
}
```

---

## Troubleshooting

### Problema 1: "Usuario no autenticado" después de refresh

**Causa**: Sesión no se está persistiendo

**Solución**:
```tsx
// Verificar configuración de storage
const { data: { session } } = await supabase.auth.getSession();
console.log('Sesión:', session);

// Forzar persistencia
await supabase.auth.setSession({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
});
```

---

### Problema 2: "Error al cargar perfil de usuario"

**Causa**: Usuario no existe en tabla `users`

**Solución**:
```tsx
// Verificar si usuario existe
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

if (error?.code === 'PGRST116') {
  // Usuario no existe, crear perfil
  await createUserProfile(userId);
}
```

---

### Problema 3: "Sesión expirada"

**Causa**: Token JWT expiró

**Solución**:
```tsx
// Refresh manual de sesión
const { data, error } = await supabase.auth.refreshSession();

if (error) {
  // Sesión no se puede refrescar, logout
  await logout();
}
```

---

## Mejores Prácticas

### 1. Siempre Validar en Cliente y Servidor
```tsx
// Cliente
if (!validateEmail(email)) {
  throw new Error('Email inválido');
}

// Servidor (RLS)
// Las políticas RLS validan en backend
```

### 2. Manejar Estados de Carga
```tsx
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  setLoading(true);
  try {
    await login(email, password);
  } finally {
    setLoading(false);
  }
};
```

### 3. Limpiar Suscripciones
```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...);

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Recursos Adicionales

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT.io](https://jwt.io/) - Decodificar tokens
- [React Context Documentation](https://react.dev/reference/react/useContext)

---

**Última Actualización**: 30 de Septiembre, 2025
**Mantenedor**: Equipo ElmecV2
**Versión del Módulo**: 2.0.0