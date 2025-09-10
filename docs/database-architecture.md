# Arquitectura de Base de Datos Supabase - ELMEC

## 📋 Resumen Ejecutivo

Esta documentación describe la arquitectura completa de base de datos para la aplicación de gestión empresarial ELMEC, implementada en Supabase con PostgreSQL como motor de base de datos.

## 🏗️ Arquitectura General

### Componentes Principales

- **PostgreSQL 15+** como motor de base de datos
- **Supabase Auth** para autenticación y autorización
- **Row Level Security (RLS)** para seguridad granular
- **Realtime** para actualizaciones en tiempo real
- **Edge Functions** para lógica de negocio compleja

### Principios de Diseño

- **Seguridad por defecto**: RLS habilitado en todas las tablas
- **Escalabilidad**: Índices optimizados y consultas eficientes
- **Auditabilidad**: Logs completos de todas las acciones
- **Flexibilidad**: Campos JSONB para datos dinámicos
- **Integridad**: Constraints y validaciones estrictas

## 📊 Esquema de Base de Datos

### 1. Módulo de Autenticación

#### Tabla: `users`

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  empresa text NOT NULL,
  nombre text NOT NULL,
  apellido_paterno text NOT NULL,
  apellido_materno text NOT NULL,
  correo_electronico text NOT NULL,
  celular text NOT NULL,
  ciudad text NOT NULL,
  estado text NOT NULL,
  rol user_role NOT NULL DEFAULT 'customer',
  categoria text,
  zona text,
  activo boolean NOT NULL DEFAULT true,
  foto text,
  last_login timestamptz,
  is_online boolean NOT NULL DEFAULT false,
  last_seen timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Características:**

- Vinculada a `auth.users` de Supabase
- Roles: `customer`, `agent`, `admin`
- Campos flexibles con `metadata` JSONB
- Tracking de presencia en tiempo real

### 2. Módulo de Solicitudes

#### Tabla: `requests`

```sql
CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  tipo integer NOT NULL DEFAULT 1,
  prioridad request_priority NOT NULL DEFAULT 'media',
  estatus request_status NOT NULL DEFAULT 'nuevo',
  usuario_id uuid NOT NULL REFERENCES users(id),
  agente_id uuid REFERENCES users(id),
  fecha_vencimiento timestamptz,
  archivos text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Estados disponibles:**

- `nuevo` - Solicitud recién creada
- `asignado` - Asignada a un agente
- `en_proceso` - En proceso de resolución
- `pausado` - Pausada temporalmente
- `resuelto` - Resuelta
- `cerrado` - Cerrada definitivamente

### 3. Sistema de Chat

#### Tabla: `chat_rooms`

```sql
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo chat_type NOT NULL DEFAULT 'support',
  participants uuid[] NOT NULL DEFAULT '{}',
  request_id uuid REFERENCES requests(id),
  is_active boolean NOT NULL DEFAULT true,
  last_message jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### Tabla: `messages`

```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL REFERENCES chat_rooms(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  sender_name text NOT NULL,
  message text NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  read_by jsonb DEFAULT '{}',
  reply_to uuid REFERENCES messages(id),
  file_url text,
  file_name text,
  file_size integer,
  audio_duration integer,
  edited_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 4. Sistema de Notificaciones

#### Tabla: `notifications`

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  body text NOT NULL,
  type notification_type NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'medium',
  data jsonb DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 5. Módulo de Calculadora

#### Tabla: `calculator_sessions`

```sql
CREATE TABLE calculator_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  type calculation_type NOT NULL,
  parameters jsonb NOT NULL DEFAULT '{}',
  results jsonb NOT NULL DEFAULT '{}',
  settings jsonb NOT NULL DEFAULT '{}',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 6. Analytics y Logs

#### Tabla: `activity_logs`

```sql
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## 🔐 Seguridad y Permisos

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

```sql
-- Ejemplo: Usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users can view own requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- Ejemplo: Agentes pueden ver solicitudes asignadas
CREATE POLICY "Agents can view assigned requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (
    agente_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND rol IN ('agent', 'admin')
    )
  );
```

### Funciones de Seguridad

#### Validación de Permisos

```sql
CREATE FUNCTION check_user_permission(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id uuid,
  p_action text
) RETURNS boolean
```

#### Auditoría de Accesos

```sql
CREATE FUNCTION audit_access(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id uuid,
  p_action text,
  p_success boolean
) RETURNS void
```

#### Rate Limiting

```sql
CREATE FUNCTION check_rate_limit(
  p_user_id uuid,
  p_action text,
  p_limit integer,
  p_window interval
) RETURNS boolean
```

## ⚡ Optimización y Performance

### Índices Estratégicos

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_requests_usuario_id ON requests(usuario_id);
CREATE INDEX idx_requests_agente_id ON requests(agente_id);
CREATE INDEX idx_requests_estatus ON requests(estatus);

-- Índices compuestos para consultas complejas
CREATE INDEX idx_requests_user_status ON requests(usuario_id, estatus);
CREATE INDEX idx_messages_room_created ON messages(chat_room_id, created_at DESC);

-- Índices para búsqueda full-text
CREATE INDEX idx_requests_fulltext ON requests
USING GIN(to_tsvector('spanish', titulo || ' ' || mensaje));
```

### Vistas Optimizadas

#### Vista de Estadísticas de Usuario

```sql
CREATE VIEW user_stats AS
SELECT
  u.id,
  u.nombre,
  u.apellido_paterno,
  u.email,
  u.rol,
  COALESCE(r.total_requests, 0) as total_requests,
  COALESCE(r.pending_requests, 0) as pending_requests,
  COALESCE(m.total_messages, 0) as total_messages
FROM users u
LEFT JOIN (...) r ON u.id = r.usuario_id
LEFT JOIN (...) m ON u.id = m.sender_id;
```

## 🔄 Tiempo Real

### Configuración de Realtime

```sql
-- Habilitar realtime para tablas críticas
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Funciones de Broadcast

```sql
CREATE FUNCTION broadcast_event(
  event_name text,
  payload jsonb
) RETURNS void
```

### Eventos en Tiempo Real

- **Nuevos mensajes**: Notificación instantánea a participantes
- **Cambios de estado**: Actualizaciones de solicitudes en tiempo real
- **Presencia de usuarios**: Estado online/offline
- **Typing indicators**: Indicadores de escritura en chat

## 📈 Analytics y Métricas

### Funciones de Analytics

#### Dashboard de Usuario

```sql
CREATE FUNCTION get_user_dashboard(p_user_id uuid)
RETURNS jsonb
```

#### Métricas del Sistema

```sql
CREATE FUNCTION get_system_metrics(
  start_date timestamptz,
  end_date timestamptz
) RETURNS jsonb
```

### Métricas Automáticas

- **Usuarios activos diarios**
- **Solicitudes creadas por día**
- **Mensajes enviados por día**
- **Tiempo promedio de resolución**
- **Tasa de satisfacción**

## 🛠️ Mantenimiento Automático

### Funciones de Limpieza

```sql
-- Ejecutar diariamente
CREATE FUNCTION daily_maintenance() RETURNS void

-- Limpiar datos antiguos
CREATE FUNCTION cleanup_old_logs() RETURNS void

-- Detectar actividad sospechosa
CREATE FUNCTION detect_suspicious_activity() RETURNS void
```

### Tareas Programadas

- **Limpieza de logs** (90 días)
- **Notificaciones expiradas**
- **Sesiones inactivas**
- **Tokens push obsoletos**
- **Chats inactivos** (30 días)

## 🚀 Implementación

### Orden de Migración

1. **001_create_users_table.sql** - Usuarios y autenticación
2. **002_create_requests_table.sql** - Sistema de solicitudes
3. **003_create_chat_system.sql** - Chat en tiempo real
4. **004_create_notifications_system.sql** - Notificaciones
5. **005_create_calculator_data.sql** - Módulo calculadora
6. **006_create_analytics_and_logs.sql** - Analytics y logs
7. **007_create_views_and_functions.sql** - Vistas y funciones
8. **008_create_realtime_subscriptions.sql** - Configuración realtime
9. **009_create_security_policies.sql** - Políticas de seguridad

### Variables de Entorno Requeridas

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuración Inicial

```sql
-- Ejecutar después de las migraciones
SELECT initialize_system();
```

## 📊 Métricas de Performance

### Objetivos de Performance

- **Consultas < 100ms** para operaciones básicas
- **Realtime latency < 50ms** para mensajes
- **99.9% uptime** para servicios críticos
- **Escalabilidad** hasta 10,000 usuarios concurrentes

### Monitoreo

- **Query performance** con `pg_stat_statements`
- **Connection pooling** con PgBouncer
- **Métricas de Supabase** dashboard
- **Alertas automáticas** para anomalías

## 🔧 Troubleshooting

### Problemas Comunes

1. **RLS Policies**: Verificar políticas de acceso
2. **Índices faltantes**: Revisar planes de ejecución
3. **Realtime issues**: Verificar suscripciones
4. **Rate limiting**: Ajustar límites según uso

### Comandos Útiles

```sql
-- Ver consultas lentas
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'requests';

-- Monitorear conexiones
SELECT * FROM pg_stat_activity;
```

## 📝 Conclusión

Esta arquitectura proporciona una base sólida, segura y escalable para la aplicación ELMEC, con todas las funcionalidades requeridas implementadas siguiendo las mejores prácticas de PostgreSQL y Supabase.

La implementación incluye:

- ✅ **Seguridad robusta** con RLS y auditoría
- ✅ **Performance optimizada** con índices estratégicos
- ✅ **Tiempo real** para experiencia interactiva
- ✅ **Analytics completos** para toma de decisiones
- ✅ **Mantenimiento automático** para operación continua
- ✅ **Escalabilidad** para crecimiento futuro
