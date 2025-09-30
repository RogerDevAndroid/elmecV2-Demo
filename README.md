# ElmecV2 - Sistema de Gestión de Solicitudes y Soporte Técnico

[![React Native](https://img.shields.io/badge/React%20Native-0.79-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-success.svg)](https://netlify.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-purple.svg)](https://redux-toolkit.js.org/)

## 📱 Descripción

**ElmecV2** es una aplicación móvil multiplataforma empresarial desarrollada con **React Native** y **Expo** para la gestión integral de solicitudes de soporte técnico y servicio al cliente. La aplicación ofrece un sistema completo de comunicación en tiempo real, gestión de solicitudes, calculadoras especializadas para ingeniería, y herramientas administrativas avanzadas.

### 🎯 Propósito del Sistema

ElmecV2 está diseñado específicamente para empresas de servicios técnicos e ingeniería que necesitan:
- **Gestión centralizada** de solicitudes de servicio y soporte
- **Comunicación en tiempo real** entre clientes, técnicos y administradores
- **Calculadoras especializadas** para procesos de fresado y barrenado
- **Seguimiento detallado** de solicitudes con estados y prioridades
- **Dashboard administrativo** con métricas y análisis en tiempo real
- **Sistema de notificaciones** para mantener a todos informados

## ✨ Características Principales

### 👤 Para Usuarios Finales (Clientes)
- **Autenticación Segura**: Sistema completo de login/registro con validación en tiempo real
- **Gestión de Solicitudes**:
  - Crear nuevas solicitudes con título, descripción, tipo y prioridad
  - Adjuntar archivos e imágenes
  - Seguimiento en tiempo real del estado
  - Historial completo de solicitudes
- **Chat en Tiempo Real**:
  - Comunicación directa con soporte/técnicos
  - Mensajes de texto, imágenes, archivos y audio
  - Indicadores de "escribiendo..."
  - Emojis y respuestas a mensajes
- **Calculadoras Especializadas**:
  - Calculadora de Fresado con múltiples operaciones
  - Calculadora de Barrenado para cálculos de perforación
  - Configuraciones personalizadas guardadas
- **Directorio de Contactos**: Acceso rápido a agentes y técnicos
- **Perfil de Usuario**: Gestión de datos personales y preferencias
- **Notificaciones Push**: Alertas de cambios de estado y nuevos mensajes

### 👨‍💼 Para Administradores y Agentes
- **Dashboard Administrativo Completo**:
  - Métricas en tiempo real (solicitudes activas, resueltas, pendientes)
  - Gráficos de tendencias y estadísticas
  - Vista general del sistema
- **Gestión de Solicitudes Avanzada**:
  - Asignación de solicitudes a agentes
  - Cambio de estados y prioridades
  - Búsqueda y filtrado avanzado
  - Exportación de reportes
- **Gestión de Usuarios**:
  - Administración de cuentas (clientes y agentes)
  - Roles y permisos (customer, agent, admin)
  - Estados de usuario (activo/inactivo)
  - Visualización de estados en línea
- **Sistema de Chat Multicanal**:
  - Múltiples salas de chat simultáneas
  - Historial completo de conversaciones
  - Soporte para archivos multimedia
- **Análisis y Reportes**:
  - Reportes de desempeño de agentes
  - Estadísticas de tiempo de respuesta
  - Métricas de satisfacción

### 🔧 Características Técnicas Avanzadas
- **Arquitectura Multiplataforma**:
  - Compatible con iOS, Android y Web
  - Código único para todas las plataformas
  - Responsive design adaptativo
- **Comunicación en Tiempo Real**:
  - WebSockets con Supabase Realtime
  - Actualizaciones instantáneas de mensajes
  - Sincronización automática de estados
  - Indicadores de presencia de usuarios
- **Optimización de Performance**:
  - Lazy loading de componentes
  - Memoización con React.memo y useMemo
  - Virtualización de listas largas con FlatList
  - Optimistic updates en el chat
  - Caché inteligente de datos
- **Gestión de Estado Robusta**:
  - Redux Toolkit para estado global de calculadora
  - Context API para autenticación, chat y notificaciones
  - Estado local optimizado con hooks personalizados
- **Manejo de Errores Profesional**:
  - Error Boundaries para captura de errores
  - Sistema de logging estructurado
  - Recuperación automática de errores
  - Feedback visual al usuario
- **Seguridad Empresarial**:
  - Autenticación JWT con Supabase Auth
  - Row Level Security (RLS) en base de datos
  - Políticas granulares de acceso
  - Validación de datos en cliente y servidor
  - Sanitización de inputs
- **Internacionalización (i18n)**:
  - Soporte multiidioma con i18next
  - Español e inglés configurados
  - Fácil extensión a más idiomas

## 🚀 Stack Tecnológico

### Frontend
- **React Native 0.79.1** - Framework principal para desarrollo móvil
- **Expo 53** - Plataforma de desarrollo y herramientas
- **TypeScript 5.8** - Tipado estático para mayor seguridad
- **Expo Router 5.1** - Navegación basada en sistema de archivos
- **React Navigation 7** - Navegación avanzada (tabs, stack, drawer)
- **Redux Toolkit 2.9** - Gestión de estado global (calculadora)
- **React Context API** - Gestión de estado (auth, chat, notificaciones)

### Backend & Base de Datos
- **Supabase 2.57** - Backend as a Service completo
  - **PostgreSQL** - Base de datos relacional robusta
  - **Supabase Auth** - Sistema de autenticación
  - **Supabase Realtime** - WebSockets para tiempo real
  - **Supabase Storage** - Almacenamiento de archivos
  - **Row Level Security (RLS)** - Seguridad a nivel de fila
  - **Políticas RLS** - Control granular de acceso

### UI/UX
- **Expo Vector Icons** - Iconos (Lucide, MaterialIcons, etc.)
- **Lucide React Native** - Iconos modernos y consistentes
- **Expo Linear Gradient** - Gradientes nativos
- **Expo Blur** - Efectos de desenfoque
- **React Native Gesture Handler** - Gestos nativos
- **React Native Reanimated** - Animaciones de alto rendimiento
- **React Native Safe Area Context** - Manejo de áreas seguras

### Funcionalidades Nativas
- **Expo Image Picker** - Selección de imágenes y cámara
- **Expo Document Picker** - Selección de documentos
- **Expo Camera** - Acceso a cámara nativa
- **Expo Media Library** - Acceso a galería
- **Expo AV** - Reproducción y grabación de audio/video
- **Expo Notifications** - Notificaciones push
- **Expo Haptics** - Feedback háptico
- **Async Storage** - Almacenamiento local persistente

### Internacionalización
- **i18next 25.5** - Framework de internacionalización
- **react-i18next 15.7** - Integración con React

### DevOps & Deployment
- **Netlify** - Hosting web y deployment automatizado
  - CI/CD automático desde Git
  - Preview deployments para PRs
  - Variables de entorno por rama
- **EAS (Expo Application Services)** - Build y deployment móvil
- **GitHub** - Control de versiones
- **ESLint 9.35** - Linting y calidad de código
- **Prettier 3.6** - Formateo automático de código
- **TypeScript Compiler** - Validación de tipos

### Herramientas de Desarrollo
- **Metro Bundler** - Bundler optimizado para React Native
- **Babel** - Transpilación de JavaScript
- **dotenv** - Gestión de variables de entorno
- **React DevTools** - Debugging de componentes

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**

### Para desarrollo móvil:
- **Expo Go** app en tu dispositivo móvil
- O un emulador de Android/iOS configurado

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/elmecV2-Demo.git
cd elmecV2-Demo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Configura las siguientes variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Environment
EXPO_PUBLIC_ENVIRONMENT=development

# Expo
EAS_PROJECT_ID=tu_eas_project_id
```

### 4. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/)
2. Ejecuta las migraciones de la base de datos (ubicadas en `/supabase/migrations/`)
3. Configura las políticas RLS según la documentación

## 🏃‍♂️ Ejecución del Proyecto

### Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm start

# Para web específicamente
npm run web

# Para Android
npm run android

# Para iOS
npm run ios
```

### Producción
```bash
# Build para producción
npm run build:production

# Deploy a Netlify
npm run deploy

# Preview deployment
npm run deploy:preview
```

## 📁 Estructura del Proyecto

```
elmecV2-Demo/
├── app/                          # Expo Router - Rutas basadas en archivos
│   ├── (tabs)/                  # Tab Navigator principal
│   │   ├── index.tsx           # Home - Lista de solicitudes
│   │   ├── requests.tsx        # Gestión de solicitudes
│   │   ├── chat/               # Sistema de chat
│   │   │   ├── index.tsx      # Lista de conversaciones
│   │   │   ├── [roomId].tsx   # Sala de chat específica
│   │   │   └── _layout.tsx    # Layout del chat
│   │   ├── directory.tsx       # Directorio de contactos
│   │   ├── calculator.tsx      # Acceso a calculadoras
│   │   ├── profile.tsx         # Perfil de usuario
│   │   └── _layout.tsx         # Layout de tabs
│   ├── auth/                    # Flujo de autenticación
│   │   ├── index.tsx           # Pantalla inicial de auth
│   │   ├── login.tsx           # Login
│   │   ├── register.tsx        # Registro
│   │   └── _layout.tsx         # Layout de auth
│   ├── calculator/              # Módulo de calculadoras
│   │   ├── index.tsx           # Menú de calculadoras
│   │   ├── FresadoScreen.tsx   # Calculadora de fresado
│   │   ├── BarrenadoScreen.tsx # Calculadora de barrenado
│   │   ├── SettingsCalculadoraScreen.tsx
│   │   └── _layout.tsx         # Layout de calculadora
│   ├── _layout.tsx              # Root layout con providers
│   ├── index.tsx                # Entry point
│   └── +not-found.tsx           # Página 404
│
├── components/                   # Componentes reutilizables
│   ├── AdminDashboard.tsx       # Dashboard administrativo
│   ├── AdvancedSearchComponent.tsx # Búsqueda avanzada
│   ├── MessageBubble.tsx        # Burbuja de mensaje en chat
│   ├── TypingIndicator.tsx      # Indicador de escritura
│   ├── EmojiPicker.tsx          # Selector de emojis
│   ├── FileUploadComponent.tsx  # Subida de archivos
│   ├── NotificationToast.tsx    # Notificaciones toast
│   ├── HeaderComponent.tsx      # Header personalizado
│   ├── HealthCheck.tsx          # Verificación de salud del sistema
│   ├── ErrorBoundary.tsx        # Captura de errores
│   ├── ContextProviders.tsx     # Proveedores de contexto
│   ├── api.ts                   # Cliente API
│   └── calculator/              # Componentes de calculadora
│       ├── CalculatorView.tsx   # Vista principal calculadora
│       └── BarrenadoView.tsx    # Vista de barrenado
│
├── contexts/                     # Context API para estado global
│   ├── AuthContext.tsx          # Contexto de autenticación
│   │   - login, register, logout
│   │   - Usuario autenticado
│   │   - Sesión activa
│   ├── ChatContext.tsx          # Contexto de chat
│   │   - Salas de chat
│   │   - Mensajes en tiempo real
│   │   - Indicadores de escritura
│   │   - Notificaciones de chat
│   └── NotificationContext.tsx  # Contexto de notificaciones
│       - Sistema de notificaciones
│       - Toast messages
│       - Push notifications
│
├── store/                        # Redux Toolkit
│   ├── index.ts                 # Configuración del store
│   └── calculatorSlice.ts       # Estado de calculadora
│       - Configuraciones guardadas
│       - Historial de cálculos
│       - Preferencias
│
├── hooks/                        # Custom Hooks
│   ├── useChat.ts               # Hook para chat
│   ├── useSupabaseHealth.ts     # Hook para health check
│   └── useFrameworkReady.ts     # Hook de inicialización
│
├── lib/                          # Librerías y configuración
│   └── supabase.ts              # Cliente de Supabase
│       - Configuración de auth
│       - Realtime setup
│       - Storage setup
│
├── constants/                    # Constantes y tipos
│   ├── types.ts                 # Tipos TypeScript globales
│   ├── commons.ts               # Constantes comunes
│   └── calculator.ts            # Constantes de calculadora
│
├── i18n/                         # Internacionalización
│   └── index.ts                 # Configuración i18next
│       - Español (es)
│       - Inglés (en)
│
├── assets/                       # Recursos estáticos
│   └── images/                  # Imágenes e iconos
│       ├── icon.png
│       └── favicon.png
│
├── android/                      # Configuración Android
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/            # Código nativo Kotlin
│   │       └── res/             # Recursos Android
│   ├── gradle.properties
│   └── settings.gradle
│
├── docs/                         # Documentación del proyecto
│   ├── mvp-roadmap.md           # Roadmap del MVP
│   ├── demo-users-guide.md      # Guía de usuarios demo
│   ├── demo-script.md           # Script de demostración
│   ├── demo-preparation-checklist.md
│   ├── demo-quick-checklist.md
│   ├── demo-express-guide.md
│   ├── demo-data-validation.md
│   ├── database-architecture.md # Arquitectura de BD
│   └── data-structures-analysis.md
│
├── app.json                      # Configuración de Expo
├── eas.json                      # Configuración de EAS Build
├── package.json                  # Dependencias del proyecto
├── tsconfig.json                 # Configuración TypeScript
├── eslint.config.js              # Configuración ESLint
├── metro.config.js               # Configuración Metro bundler
├── netlify.toml                  # Configuración Netlify
└── README.md                     # Este archivo
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Linting
npm run lint

# Formateo de código
npm run format
```

## 📊 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run web` | Ejecuta la versión web |
| `npm run android` | Ejecuta en Android |
| `npm run ios` | Ejecuta en iOS |
| `npm run build:production` | Build optimizado para producción |
| `npm run deploy` | Deploy a producción en Netlify |
| `npm run deploy:preview` | Deploy de preview |
| `npm run lint` | Ejecuta ESLint |
| `npm run lint:fix` | Corrige errores de linting automáticamente |
| `npm run format` | Formatea el código con Prettier |
| `npm test` | Ejecuta los tests |

## 🔐 Seguridad

### Autenticación
- JWT tokens para autenticación
- Refresh tokens para sesiones persistentes
- Logout automático por inactividad

### Base de Datos
- Row Level Security (RLS) habilitado
- Políticas de acceso granulares
- Validación de datos en el servidor

### Variables de Entorno
- Todas las claves sensibles en variables de entorno
- Diferentes configuraciones por entorno
- Nunca commitear archivos `.env`

## 🚀 Deployment

### Netlify (Web)
La aplicación se despliega automáticamente en Netlify:

1. **Automático**: Push a `main` despliega a producción
2. **Manual**: `npm run deploy`
3. **Preview**: `npm run deploy:preview`

### Mobile (Expo)
Para deployment móvil:

```bash
# Build para stores
eas build --platform all

# Submit a stores
eas submit --platform all
```

## 📈 Monitoreo y Logging

### Sistema de Errores
- Logging automático de errores
- Categorización por severidad
- Queue local para errores offline
- Integración con servicios externos (preparado para Sentry)

### Performance
- Métricas de rendimiento automáticas
- Logging de acciones de usuario
- Monitoreo de llamadas API

## 🤝 Contribución

### Workflow de Desarrollo
1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Estándares de Código
- Seguir las reglas de ESLint configuradas
- Usar TypeScript para todo el código nuevo
- Escribir tests para nuevas funcionalidades
- Documentar funciones complejas
- Usar commits semánticos

### Code Review
- Todos los PRs requieren revisión
- Tests deben pasar
- Linting debe estar limpio
- Performance debe ser considerada

## 📝 Changelog

### v2.0.0 (Actual)
- ✨ Nuevo sistema de gestión de solicitudes
- 🔧 Migración a Expo 51 y React Native 0.74
- 🎨 Rediseño completo de la interfaz
- 🔐 Mejoras en seguridad y autenticación
- 📊 Dashboard de administración avanzado
- 🚀 Optimizaciones de performance
- 🛠️ Sistema robusto de manejo de errores

## 🐛 Problemas Conocidos

- **Web**: Algunas funcionalidades nativas no están disponibles
- **iOS**: Requiere configuración adicional para notificaciones push
- **Android**: Permisos de cámara requieren configuración manual

## 📞 Soporte

### Documentación
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)

### Contacto
- **Email**: soporte@elmec.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/elmecV2-Demo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/elmecV2-Demo/discussions)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ por el equipo de ElmecV2**

*¿Encontraste un bug o tienes una sugerencia? [Abre un issue](https://github.com/tu-usuario/elmecV2-Demo/issues/new) y ayúdanos a mejorar.*
