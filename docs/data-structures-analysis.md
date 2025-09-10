# Análisis de Estructuras de Datos - ELMEC Mobile App

## 1. MÓDULO DE AUTENTICACIÓN

### 1.1 User (Usuario)

```typescript
interface User {
  id: string; // UUID único del usuario
  email: string; // Email para autenticación
  empresa: string; // Nombre de la empresa
  nombre: string; // Nombre del usuario
  apellido_paterno: string; // Apellido paterno
  apellido_materno: string; // Apellido materno
  correo_electronico: string; // Email de contacto
  celular: string; // Número de teléfono
  ciudad: string; // Ciudad de residencia
  estado: string; // Estado/provincia
  rol: 'customer' | 'agent' | 'admin'; // Rol del usuario
  categoria?: string; // Categoría específica (para agentes)
  zona?: string; // Zona de trabajo (para agentes)
  activo: boolean; // Estado activo/inactivo
  foto?: string; // URL de la foto de perfil
  created_at: string; // Fecha de creación
  updated_at: string; // Fecha de última actualización
  last_login?: string; // Último inicio de sesión
  is_online: boolean; // Estado en línea
  last_seen: string; // Última vez visto
}
```

**Relaciones:**

- Un usuario puede tener múltiples solicitudes
- Un usuario puede participar en múltiples chats
- Un usuario puede recibir múltiples notificaciones

---

## 2. MÓDULO DE SOLICITUDES

### 2.1 Request (Solicitud)

```typescript
interface Request {
  id: string; // UUID único de la solicitud
  titulo: string; // Título de la solicitud
  mensaje: string; // Descripción detallada
  tipo: number; // Tipo de solicitud (1-5)
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'; // Nivel de prioridad
  estatus:
    | 'nuevo'
    | 'asignado'
    | 'en_proceso'
    | 'pausado'
    | 'resuelto'
    | 'cerrado';
  usuario_id: string; // ID del usuario que crea la solicitud
  agente_id?: string; // ID del agente asignado (opcional)
  created_at: string; // Fecha de creación
  updated_at: string; // Fecha de última actualización
  fecha_vencimiento?: string; // Fecha límite (opcional)
  archivos?: string[]; // URLs de archivos adjuntos
  tags?: string[]; // Etiquetas para categorización
  rating?: number; // Calificación del servicio (1-5)
  feedback?: string; // Comentarios del usuario
  metadata?: any; // Datos adicionales flexibles
}
```

**Tipos de Solicitud:**

```typescript
const REQUEST_TYPES = {
  TECHNICAL_SUPPORT: 1, // Soporte técnico
  BILLING_INQUIRY: 2, // Consulta de facturación
  PRODUCT_INFO: 3, // Información de productos
  COMPLAINT: 4, // Queja
  SUGGESTION: 5, // Sugerencia
};
```

**Estados de Solicitud:**

```typescript
const REQUEST_STATUS = {
  NEW: 'nuevo', // Recién creada
  ASSIGNED: 'asignado', // Asignada a un agente
  IN_PROGRESS: 'en_proceso', // En proceso de resolución
  PAUSED: 'pausado', // Pausada temporalmente
  RESOLVED: 'resuelto', // Resuelta
  CLOSED: 'cerrado', // Cerrada definitivamente
};
```

---

## 3. MÓDULO DE CHAT

### 3.1 ChatRoom (Sala de Chat)

```typescript
interface ChatRoom {
  id: string; // UUID único de la sala
  tipo: 'support' | 'sales' | 'general'; // Tipo de chat
  participants: string[]; // Array de IDs de participantes
  request_id?: string; // ID de solicitud relacionada (opcional)
  created_at: string; // Fecha de creación
  updated_at: string; // Fecha de última actualización
  last_message?: any; // Último mensaje enviado
  is_active: boolean; // Estado activo/inactivo
  metadata?: any; // Datos adicionales
}
```

### 3.2 Message (Mensaje)

```typescript
interface Message {
  id: string; // UUID único del mensaje
  chat_room_id: string; // ID de la sala de chat
  sender_id: string; // ID del remitente
  sender_name: string; // Nombre del remitente
  message: string; // Contenido del mensaje
  type: 'text' | 'image' | 'file' | 'audio' | 'system'; // Tipo de mensaje
  created_at: string; // Fecha de envío
  read_by?: any; // Información de lectura
  reply_to?: string; // ID del mensaje al que responde
  file_url?: string; // URL del archivo (si aplica)
  file_name?: string; // Nombre del archivo
  file_size?: number; // Tamaño del archivo
  audio_duration?: number; // Duración del audio (segundos)
  edited_at?: string; // Fecha de edición
  is_deleted: boolean; // Mensaje eliminado
}
```

---

## 4. MÓDULO DE NOTIFICACIONES

### 4.1 Notification (Notificación)

```typescript
interface Notification {
  id: string; // UUID único
  user_id: string; // ID del usuario destinatario
  title: string; // Título de la notificación
  body: string; // Contenido de la notificación
  type: 'request_update' | 'new_message' | 'assignment' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high'; // Prioridad
  data?: any; // Datos adicionales
  read: boolean; // Estado de lectura
  created_at: string; // Fecha de creación
  read_at?: string; // Fecha de lectura
  expired_at?: string; // Fecha de expiración
}
```

### 4.2 InAppNotification (Notificación en App)

```typescript
interface InAppNotification {
  id: string; // UUID único
  title: string; // Título
  body: string; // Contenido
  type: 'info' | 'success' | 'warning' | 'error'; // Tipo visual
  timestamp: string; // Fecha y hora
  data?: any; // Datos adicionales
  read: boolean; // Estado de lectura
}
```

---

## 5. MÓDULO DE DIRECTORIO

### 5.1 PersonnelMember (Miembro del Personal)

```typescript
interface PersonnelMember {
  id: string; // UUID único
  id_corto: string; // ID corto para referencia
  nombre_completo: string; // Nombre completo
  correo_electronico: string; // Email de contacto
  telefono: string; // Número de teléfono
  zona: string; // Zona de trabajo
  categoria: 'Agentes de venta' | 'Servicio al Cliente' | 'Soporte';
  activo: boolean; // Estado activo/inactivo
}
```

---

## 6. MÓDULO DE CALCULADORA

### 6.1 Configuración de Medidas

```typescript
const medida_mt = {
  mm: 'mm', // Milímetros
  mmin: 'm/min', // Metros por minuto
  mmrev: 'mm/rev', // Milímetros por revolución
  mmmin: 'mm/min', // Milímetros por minuto
  rpm: 'rpm', // Revoluciones por minuto
  cm3min: 'cm³/min', // Centímetros cúbicos por minuto
};

const medida_imp = {
  mm: 'in', // Pulgadas
  mmin: 'ft/min', // Pies por minuto
  mmrev: 'in/rev', // Pulgadas por revolución
  mmmin: 'in/min', // Pulgadas por minuto
  rpm: 'rpm', // Revoluciones por minuto
  cm3min: 'in³/min', // Pulgadas cúbicas por minuto
};
```

### 6.2 Parámetros de Barrenado

```typescript
interface BarrenadoParams {
  D: number; // Diámetro
  Z: number; // Número de filos
  N: number; // Velocidad de giro (RPM)
  Vc: number; // Velocidad de corte
  fz: number; // Avance por filo
  fn: number; // Avance por revolución
  Vf: number; // Velocidad de avance
  Pb: number; // Profundidad de barrenado
  Nb: number; // Número de barrenos
  Tc: number; // Tiempo de corte (calculado)
  Q: number; // Tasa de remoción (calculado)
}
```

### 6.3 Parámetros de Fresado

```typescript
interface FresadoParams {
  D: number; // Diámetro
  Z: number; // Número de filos
  N: number; // Velocidad de giro (RPM)
  Vc: number; // Velocidad de corte
  fz: number; // Avance por filo
  fn: number; // Avance por revolución
  Vf: number; // Velocidad de avance
  ap: number; // Profundidad axial
  ae: number; // Profundidad radial
  Np: number; // Número de pasadas
  Lm: number; // Longitud de maquinado
  Tc: number; // Tiempo de corte (calculado)
  Q: number; // Tasa de remoción (calculado)
}
```

---

## 7. ESTRUCTURAS DE CONTEXTO

### 7.1 AuthContext

```typescript
interface AuthContextType {
  isAuthenticated: boolean; // Estado de autenticación
  user: User | null; // Usuario actual
  session: Session | null; // Sesión de Supabase
  loading: boolean; // Estado de carga
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: UserData & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

### 7.2 ChatContext

```typescript
interface ChatContextType {
  chatRooms: ChatRoom[]; // Salas de chat
  messages: { [roomId: string]: Message[] }; // Mensajes por sala
  sendMessage: (
    roomId: string,
    message: string,
    type?: MessageType
  ) => Promise<void>;
  createChatRoom: (participantId: string, name: string) => Promise<string>;
  markMessagesAsRead: (roomId: string) => void;
  getChatRoom: (roomId: string) => ChatRoom | undefined;
  getUnreadCount: () => number;
  loading: boolean;
}
```

### 7.3 NotificationContext

```typescript
interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  inAppNotifications: InAppNotification[];
  unreadCount: number;
  sendDemoNotification: (
    title: string,
    body: string,
    type?: NotificationType
  ) => Promise<void>;
  sendLocalNotification: (
    title: string,
    body: string,
    data?: any
  ) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
```

---

## 8. ESTRUCTURAS DE RESPUESTA API

### 8.1 ApiResponse

```typescript
interface ApiResponse<T> {
  success: boolean; // Éxito de la operación
  data?: T; // Datos de respuesta
  message?: string; // Mensaje descriptivo
  errors?: ValidationError[]; // Errores de validación
}
```

### 8.2 PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  results: T[]; // Resultados de la página
  count: number; // Total de elementos
  next: string | null; // URL de la siguiente página
  previous: string | null; // URL de la página anterior
}
```

---

## 9. RELACIONES ENTRE ENTIDADES

### 9.1 Diagrama de Relaciones

```
User (1) -----> (N) Request
User (1) -----> (N) Notification
User (N) <----> (N) ChatRoom (participants)
ChatRoom (1) -> (N) Message
Request (1) ----> (1) ChatRoom (opcional)
User (agent) (1) -> (N) Request (asignadas)
```

### 9.2 Flujo de Datos Principal

1. **Usuario se registra** → Crea User
2. **Usuario crea solicitud** → Crea Request
3. **Sistema asigna agente** → Actualiza Request.agente_id
4. **Se crea chat** → Crea ChatRoom vinculado a Request
5. **Intercambio de mensajes** → Crea Message en ChatRoom
6. **Notificaciones** → Crea Notification para actualizaciones

---

## 10. CONSIDERACIONES DE DISEÑO

### 10.1 Escalabilidad

- **UUIDs** para todos los IDs principales
- **Índices** en campos de búsqueda frecuente
- **Paginación** para listas grandes
- **Soft deletes** para mantener integridad referencial

### 10.2 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- **Políticas de acceso** basadas en roles
- **Validación** en cliente y servidor
- **Encriptación** de datos sensibles

### 10.3 Performance

- **Desnormalización** controlada para consultas frecuentes
- **Cache** de datos estáticos
- **Lazy loading** de imágenes y archivos
- **Optimistic updates** en la UI

---

## 11. MIGRACIONES Y VERSIONADO

### 11.1 Estrategia de Migración

- **Migraciones incrementales** con nombres descriptivos
- **Rollback plans** para cada migración
- **Backup** antes de cambios estructurales
- **Testing** en ambiente de desarrollo

### 11.2 Versionado de API

- **Versionado semántico** para cambios de esquema
- **Backward compatibility** por al menos 2 versiones
- **Deprecation warnings** antes de eliminar campos
- **Documentación** actualizada con cada cambio

---

Este análisis proporciona una visión completa de todas las estructuras de datos del proyecto ELMEC, sus relaciones y consideraciones de diseño.
