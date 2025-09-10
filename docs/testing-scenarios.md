# 🧪 Escenarios de Prueba Detallados - ELMEC

## 🎭 **Guía de Testing Completa**

### **Preparación Inicial**

1. Ejecutar migración `insert_demo_data_complete.sql`
2. Verificar que todos los usuarios estén en Supabase Auth
3. Confirmar que las tablas tengan datos

---

## 📱 **Escenarios por Funcionalidad**

### **1. AUTENTICACIÓN Y PERFILES**

#### **Test 1.1: Login como Cliente**

- **Usuario:** `cliente@gmail.com` / `password`
- **Expectativa:**
  - Login exitoso
  - Redirección a home
  - Perfil completo visible
  - 2 notificaciones sin leer

#### **Test 1.2: Login como Agente**

- **Usuario:** `j.gonzalez@elmec.com.mx` / `password`
- **Expectativa:**
  - Login exitoso
  - Ver solicitudes asignadas
  - 1 notificación sin leer
  - Estado "en línea" visible

#### **Test 1.3: Login como Admin**

- **Usuario:** `i.pineda@elmec.com.mx` / `password`
- **Expectativa:**
  - Dashboard administrativo
  - Métricas del sistema
  - Acceso a todas las funciones

---

### **2. GESTIÓN DE SOLICITUDES**

#### **Test 2.1: Ver Solicitudes como Cliente**

- **Usuario:** `cliente@gmail.com`
- **Expectativa:**
  - Ver 3 solicitudes propias
  - Estados: EN PROCESO, RESUELTO, ASIGNADO
  - Información de agentes asignados

#### **Test 2.2: Crear Nueva Solicitud**

- **Usuario:** Cualquier cliente
- **Pasos:**
  1. Ir a Solicitudes → Botón +
  2. Llenar formulario completo
  3. Seleccionar agente (opcional)
  4. Adjuntar archivos
  5. Enviar
- **Expectativa:**
  - Solicitud creada exitosamente
  - Notificación de confirmación
  - Aparece en la lista

#### **Test 2.3: Gestionar Solicitudes como Agente**

- **Usuario:** `j.gonzalez@elmec.com.mx`
- **Pasos:**
  1. Ver solicitudes asignadas
  2. Tocar una solicitud
  3. Cambiar estado
- **Expectativa:**
  - Ver solicitud urgente de CNC
  - Poder cambiar estados
  - Notificación al cliente

---

### **3. CHAT EN TIEMPO REAL**

#### **Test 3.1: Chat Activo de Soporte**

- **Usuario:** `cliente@gmail.com`
- **Expectativa:**
  - Ver chat con Javier González
  - 9 mensajes de conversación sobre CNC
  - Poder enviar nuevos mensajes
  - Indicadores de lectura

#### **Test 3.2: Iniciar Nuevo Chat**

- **Usuario:** Cualquier cliente
- **Pasos:**
  1. Ir a Directorio
  2. Seleccionar un agente
  3. Tocar "Chat"
- **Expectativa:**
  - Crear nueva sala de chat
  - Redirección automática
  - Mensaje de bienvenida

#### **Test 3.3: Chat de Ventas**

- **Usuario:** `cliente2@empresa.com`
- **Expectativa:**
  - Ver chat con Carlos Mendoza
  - Conversación sobre productos
  - Contexto de ventas

---

### **4. DIRECTORIO DE PERSONAL**

#### **Test 4.1: Búsqueda y Filtros**

- **Pasos:**
  1. Buscar "González"
  2. Filtrar por "Soporte Técnico"
  3. Filtrar por zona "Centro"
- **Expectativa:**
  - Encontrar a Javier González
  - Filtros funcionando correctamente
  - Información completa visible

#### **Test 4.2: Acciones de Contacto**

- **Pasos:**
  1. Seleccionar cualquier persona
  2. Probar botones: Llamar, WhatsApp, Email, Chat
- **Expectativa:**
  - Llamar: Abrir marcador
  - WhatsApp: Abrir WhatsApp (si está instalado)
  - Email: Abrir cliente de correo
  - Chat: Crear/abrir conversación

---

### **5. NOTIFICACIONES**

#### **Test 5.1: Notificaciones In-App**

- **Usuario:** `cliente@gmail.com`
- **Expectativa:**
  - 2 notificaciones sin leer
  - Poder marcar como leídas
  - Diferentes tipos (actualización, mensaje)

#### **Test 5.2: Generar Notificaciones Demo**

- **Usuario:** Cualquier usuario
- **Pasos:**
  1. Ir a Perfil
  2. Usar botones de demo de notificaciones
- **Expectativa:**
  - Notificaciones aparecen inmediatamente
  - Diferentes tipos visuales
  - Contador actualizado

---

### **6. CALCULADORA DE MAQUINADO**

#### **Test 6.1: Sesiones Guardadas**

- **Usuario:** `cliente@gmail.com`
- **Expectativa:**
  - Ver 2 sesiones favoritas
  - Poder cargar parámetros guardados
  - Datos de barrenado y fresado

#### **Test 6.2: Nuevos Cálculos**

- **Pasos:**
  1. Ir a Calculadora → Barrenado
  2. Ingresar valores
  3. Ver cálculos automáticos
  4. Guardar sesión
- **Expectativa:**
  - Cálculos correctos
  - Interfaz responsiva
  - Guardado exitoso

#### **Test 6.3: Plantillas Públicas**

- **Expectativa:**
  - 3 plantillas disponibles
  - Poder cargar parámetros
  - Diferentes materiales

---

### **7. PANEL DE ADMINISTRACIÓN**

#### **Test 7.1: Dashboard Ejecutivo**

- **Usuario:** `i.pineda@elmec.com.mx`
- **Expectativa:**
  - Métricas del sistema
  - Gráficos de solicitudes
  - Estadísticas en tiempo real

#### **Test 7.2: Gestión de Usuarios**

- **Expectativa:**
  - Ver todos los usuarios
  - Estadísticas de actividad
  - Acciones administrativas

---

## 🔄 **Flujos de Trabajo Completos**

### **Flujo 1: Cliente con Problema Urgente**

1. **Login** como `cliente@gmail.com`
2. **Ver** solicitud urgente en proceso
3. **Abrir** chat con agente de soporte
4. **Enviar** mensaje adicional
5. **Recibir** respuesta del agente
6. **Usar** calculadora para verificar parámetros

### **Flujo 2: Agente Resolviendo Casos**

1. **Login** como `j.gonzalez@elmec.com.mx`
2. **Ver** solicitudes asignadas
3. **Actualizar** estado de solicitud
4. **Responder** en chat
5. **Marcar** como resuelto
6. **Ver** notificación de confirmación

### **Flujo 3: Proceso de Ventas**

1. **Login** como `cliente2@empresa.com`
2. **Buscar** agente de ventas en directorio
3. **Iniciar** chat de ventas
4. **Solicitar** información de productos
5. **Usar** calculadora para evaluar parámetros
6. **Crear** solicitud formal

---

## 📊 **Métricas de Validación**

### **Datos Esperados:**

- ✅ **8 usuarios** con roles diferentes
- ✅ **5 solicitudes** en varios estados
- ✅ **3 chats activos** con historial
- ✅ **23 mensajes** intercambiados
- ✅ **5 notificaciones** de diferentes tipos
- ✅ **3 sesiones** de calculadora guardadas
- ✅ **3 plantillas** públicas disponibles
- ✅ **7 logs** de actividad
- ✅ **6 métricas** del sistema

### **Estados del Sistema:**

- 🟢 **Base de datos:** Completamente poblada
- 🟢 **Relaciones:** Todas las FK correctas
- 🟢 **RLS:** Políticas funcionando
- 🟢 **Realtime:** Configurado y activo
- 🟢 **Notificaciones:** Sistema completo

---

## 🎯 **Checklist de Validación**

### **Antes de Probar:**

- [ ] Migración SQL ejecutada sin errores
- [ ] Usuarios visibles en Supabase Auth
- [ ] Tablas pobladas en Table Editor
- [ ] Variables de entorno configuradas

### **Durante las Pruebas:**

- [ ] Login exitoso con todos los usuarios
- [ ] Navegación fluida entre secciones
- [ ] Datos cargando correctamente
- [ ] Sin errores en consola
- [ ] Notificaciones funcionando
- [ ] Chat en tiempo real operativo

### **Funcionalidades Críticas:**

- [ ] Crear solicitudes
- [ ] Enviar mensajes de chat
- [ ] Recibir notificaciones
- [ ] Usar calculadora
- [ ] Buscar en directorio
- [ ] Cambiar estados (agentes)
- [ ] Ver dashboard (admin)

---

## 🚨 **Problemas Conocidos y Soluciones**

### **Si no aparecen datos:**

1. Verificar que la migración se ejecutó completamente
2. Revisar que los usuarios existan en auth.users
3. Comprobar políticas RLS

### **Si hay errores de permisos:**

1. Verificar que las políticas RLS estén activas
2. Confirmar que el usuario esté autenticado
3. Revisar logs de Supabase

### **Si el chat no funciona:**

1. Verificar configuración de Realtime
2. Comprobar que las salas de chat existan
3. Revisar permisos de participantes

---

## 🎉 **¡Listo para Demo Completo!**

Con estos datos demo, la aplicación ELMEC está completamente funcional y lista para demostrar todas sus capacidades en un entorno realista y profesional.
