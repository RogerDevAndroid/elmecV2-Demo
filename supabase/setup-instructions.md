# 🚀 Guía de Configuración de Supabase - ELMEC

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión o crea una cuenta
4. Crea un nuevo proyecto:
   - **Name:** ELMEC Mobile App
   - **Database Password:** (guarda esta contraseña)
   - **Region:** Selecciona la más cercana a tu ubicación

## Paso 2: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (algo como: `https://abcdefgh.supabase.co`)
   - **anon public** key (clave pública anónima)

## Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
EXPO_PUBLIC_ENVIRONMENT=development
```

## Paso 4: Ejecutar Migraciones

### Opción A: SQL Editor (Recomendado)

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y pega cada archivo SQL de la carpeta `supabase/migrations/`
3. Ejecuta en este orden:
   - `001_create_users_table.sql`
   - `002_create_requests_table.sql`
   - `003_create_chat_system.sql`
   - `004_create_notifications_system.sql`
   - `005_create_calculator_data.sql`
   - `006_create_analytics_and_logs.sql`

### Opción B: CLI (Avanzado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Configurar conexión
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push
```

## Paso 5: Configurar Autenticación

1. Ve a **Authentication** → **Settings**
2. Configura:
   - **Site URL:** `https://jolly-bonbon-524548.netlify.app`
   - **Redirect URLs:** Agrega la URL de tu app
   - **Email confirmation:** Deshabilitado (para demo)

## Paso 6: Crear Usuarios Demo

Ve a **Authentication** → **Users** y crea estos usuarios:

### Usuario Admin

- **Email:** `admin@elmec.com`
- **Password:** `password`
- **Email Confirmed:** ✅

### Usuario Agente

- **Email:** `carlos.mendoza@elmec.com`
- **Password:** `password`
- **Email Confirmed:** ✅

### Usuario Cliente

- **Email:** `cliente1@empresa.com`
- **Password:** `password`
- **Email Confirmed:** ✅

## Paso 7: Verificar Configuración

1. Ve a **Table Editor**
2. Deberías ver estas tablas:
   - `users`
   - `requests`
   - `chat_rooms`
   - `messages`
   - `notifications`
   - `calculator_sessions`

## 🎯 ¡Listo para Probar!

Una vez completados estos pasos:

1. Actualiza tu aplicación desplegada
2. Inicia sesión con cualquiera de los usuarios demo
3. Prueba todas las funcionalidades

## 🆘 Solución de Problemas

### Error de Conexión

- Verifica que las URLs y claves sean correctas
- Asegúrate de que no haya espacios extra

### Error de Autenticación

- Confirma que los usuarios estén marcados como "Email Confirmed"
- Verifica la configuración de Site URL

### Tablas No Aparecen

- Ejecuta las migraciones en orden
- Verifica que no haya errores en el SQL Editor
