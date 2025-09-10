/*
  # Insertar Datos Demo Completos - ELMEC

  Este script inserta datos demo completos para la aplicación ELMEC usando los usuarios existentes.
  
  1. Actualización de Perfiles de Usuario
    - Completa información de usuarios existentes
    - Asigna roles y categorías apropiadas
    - Configura estados de conexión
  
  2. Solicitudes de Ejemplo
    - 5 solicitudes con diferentes estados
    - Prioridades variadas (baja, media, alta, urgente)
    - Relaciones usuario-agente establecidas
  
  3. Sistema de Chat
    - 3 salas de chat activas
    - 23 mensajes intercambiados
    - Diferentes tipos de conversación
  
  4. Notificaciones
    - 5 notificaciones de diferentes tipos
    - Estados de lectura variados
    - Prioridades y categorías
  
  5. Sesiones de Calculadora
    - 3 sesiones guardadas con datos reales
    - Sistema de favoritos
    - Plantillas públicas
  
  6. Métricas y Analytics
    - Logs de actividad del sistema
    - Métricas de performance
    - Datos para dashboard administrativo
*/

-- =====================================================
-- 1. ACTUALIZAR PERFILES DE USUARIOS EXISTENTES
-- =====================================================

-- Actualizar usuario admin
UPDATE users SET
  empresa = 'ELMEC Corporativo',
  nombre = 'Ivan',
  apellido_paterno = 'Pineda',
  apellido_materno = 'Rodriguez',
  correo_electronico = 'i.pineda@elmec.com.mx',
  celular = '+52 81 1234-5678',
  ciudad = 'Monterrey',
  estado = 'Nuevo León',
  rol = 'admin',
  categoria = 'Administración',
  zona = 'Corporativo',
  activo = true,
  is_online = true,
  last_login = now() - interval '30 minutes',
  last_seen = now() - interval '5 minutes',
  metadata = '{"department": "IT", "access_level": "full", "permissions": ["all"]}'::jsonb,
  updated_at = now()
WHERE email = 'i.pineda@elmec.com.mx';

-- Actualizar agente de soporte
UPDATE users SET
  empresa = 'ELMEC',
  nombre = 'Javier',
  apellido_paterno = 'González',
  apellido_materno = 'Ruiz',
  correo_electronico = 'j.gonzalez@elmec.com.mx',
  celular = '+52 81 2345-6789',
  ciudad = 'Guadalajara',
  estado = 'Jalisco',
  rol = 'agent',
  categoria = 'Soporte Técnico',
  zona = 'Centro',
  activo = true,
  is_online = true,
  last_login = now() - interval '1 hour',
  last_seen = now() - interval '10 minutes',
  metadata = '{"specialization": "CNC", "experience_years": 5, "certifications": ["ISO9001"]}'::jsonb,
  updated_at = now()
WHERE email = 'j.gonzalez@elmec.com.mx';

-- Actualizar cliente principal
UPDATE users SET
  empresa = 'Empresa Industrial SA',
  nombre = 'María',
  apellido_paterno = 'López',
  apellido_materno = 'Pérez',
  correo_electronico = 'cliente@gmail.com',
  celular = '+52 55 3456-7890',
  ciudad = 'Ciudad de México',
  estado = 'CDMX',
  rol = 'customer',
  categoria = null,
  zona = null,
  activo = true,
  is_online = true,
  last_login = now() - interval '2 hours',
  last_seen = now() - interval '15 minutes',
  metadata = '{"company_size": "medium", "industry": "manufacturing", "annual_volume": "high"}'::jsonb,
  updated_at = now()
WHERE email = 'cliente@gmail.com';

-- Actualizar segundo cliente
UPDATE users SET
  empresa = 'Desarrollo Personal',
  nombre = 'Roberto',
  apellido_paterno = 'García',
  apellido_materno = 'Vital',
  correo_electronico = 'rgarciavital@gmail.com',
  celular = '+52 33 4567-8901',
  ciudad = 'Tijuana',
  estado = 'Baja California',
  rol = 'customer',
  categoria = null,
  zona = null,
  activo = true,
  is_online = false,
  last_login = now() - interval '1 day',
  last_seen = now() - interval '2 hours',
  metadata = '{"company_size": "small", "industry": "automotive", "annual_volume": "medium"}'::jsonb,
  updated_at = now()
WHERE email = 'rgarciavital@gmail.com';

-- =====================================================
-- 2. INSERTAR SOLICITUDES DE EJEMPLO
-- =====================================================

-- Solicitud 1: Soporte técnico urgente (María → Javier)
INSERT INTO requests (
  id,
  titulo,
  mensaje,
  tipo,
  prioridad,
  estatus,
  usuario_id,
  agente_id,
  fecha_vencimiento,
  archivos,
  tags,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Equipo CNC con errores E404 recurrentes',
  'Nuestro equipo CNC Haas VF-2 está presentando errores E404 cada 30 minutos aproximadamente. El error aparece durante operaciones de fresado en aluminio 6061. Ya revisamos el manual pero no encontramos solución. Necesitamos asistencia técnica urgente ya que tenemos producción detenida.',
  1, -- Soporte técnico
  'urgente',
  'en_proceso',
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'),
  now() + interval '4 hours',
  ARRAY['manual_cnc.pdf', 'error_log.txt'],
  ARRAY['CNC', 'Haas', 'E404', 'urgente', 'producción'],
  '{"machine_model": "Haas VF-2", "error_frequency": "every_30_min", "material": "aluminum_6061", "production_impact": "high"}'::jsonb,
  now() - interval '3 hours',
  now() - interval '30 minutes'
);

-- Solicitud 2: Consulta sobre facturación (María → Javier) - RESUELTA
INSERT INTO requests (
  id,
  titulo,
  mensaje,
  tipo,
  prioridad,
  estatus,
  usuario_id,
  agente_id,
  archivos,
  tags,
  rating,
  feedback,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Dudas sobre cargos en factura FAC-2024-001',
  'Tenemos dudas sobre algunos cargos que aparecen en la factura FAC-2024-001. Específicamente sobre los cargos por servicios adicionales que no recordamos haber solicitado. ¿Podrían revisar y explicar estos conceptos?',
  2, -- Facturación
  'media',
  'resuelto',
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'),
  ARRAY['factura_FAC-2024-001.pdf'],
  ARRAY['facturación', 'cargos', 'servicios'],
  5,
  'Excelente atención, muy rápida la respuesta y clara la explicación. El ajuste se procesó inmediatamente.',
  '{"invoice_number": "FAC-2024-001", "disputed_amount": 2500.00, "resolution": "credit_note_issued"}'::jsonb,
  now() - interval '5 days',
  now() - interval '2 days'
);

-- Solicitud 3: Información sobre productos (Roberto → Javier)
INSERT INTO requests (
  id,
  titulo,
  mensaje,
  tipo,
  prioridad,
  estatus,
  usuario_id,
  agente_id,
  tags,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Información sobre productos de maquinado de precisión',
  'Estamos evaluando la compra de herramientas de maquinado de precisión para trabajar con aluminio aeroespacial. Necesitamos información sobre disponibilidad, precios y especificaciones técnicas. Nuestro presupuesto está entre $50,000 y $100,000.',
  3, -- Información de productos
  'media',
  'asignado',
  (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'),
  (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'),
  ARRAY['productos', 'maquinado', 'precisión', 'aluminio', 'aeroespacial'],
  '{"budget_range": "50000-100000", "material_focus": "aerospace_aluminum", "timeline": "Q2_2024"}'::jsonb,
  now() - interval '2 days',
  now() - interval '1 day'
);

-- Solicitud 4: Queja sobre tiempo de respuesta (Roberto → Sin asignar)
INSERT INTO requests (
  id,
  titulo,
  mensaje,
  tipo,
  prioridad,
  estatus,
  usuario_id,
  tags,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Tiempo de respuesta muy lento en soporte',
  'He notado que el tiempo de respuesta del equipo de soporte ha aumentado considerablemente. Mi última solicitud tardó 48 horas en recibir respuesta inicial, cuando antes era de 4-6 horas máximo. Esto está afectando nuestros tiempos de producción.',
  4, -- Queja
  'alta',
  'nuevo',
  (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'),
  ARRAY['queja', 'tiempo_respuesta', 'soporte', 'SLA'],
  '{"previous_response_time": "4-6 hours", "current_response_time": "48 hours", "impact": "production_delays"}'::jsonb,
  now() - interval '6 hours',
  now() - interval '6 hours'
);

-- Solicitud 5: Sugerencia para app móvil (María → Admin)
INSERT INTO requests (
  id,
  titulo,
  mensaje,
  tipo,
  prioridad,
  estatus,
  usuario_id,
  agente_id,
  tags,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Sugerencias para mejorar la aplicación móvil',
  'La aplicación móvil está muy bien, pero me gustaría sugerir algunas mejoras: 1) Notificaciones push para actualizaciones de solicitudes, 2) Modo oscuro para usar en talleres con poca luz, 3) Posibilidad de adjuntar fotos directamente desde la cámara, 4) Calculadora offline.',
  5, -- Sugerencia
  'baja',
  'asignado',
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  (SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'),
  ARRAY['sugerencia', 'app_móvil', 'mejoras', 'UX'],
  '{"suggestions": ["push_notifications", "dark_mode", "camera_integration", "offline_calculator"], "priority_order": [1, 2, 3, 4]}'::jsonb,
  now() - interval '1 day',
  now() - interval '12 hours'
);

-- =====================================================
-- 3. CREAR SALAS DE CHAT
-- =====================================================

-- Chat 1: Soporte técnico urgente (María ↔ Javier)
INSERT INTO chat_rooms (
  id,
  tipo,
  participants,
  request_id,
  is_active,
  metadata,
  created_at,
  updated_at
) VALUES (
  'chat-support-maria-javier',
  'support',
  ARRAY[
    (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
    (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx')
  ],
  (SELECT id FROM requests WHERE titulo LIKE '%CNC con errores E404%'),
  true,
  '{"participant_names": ["María López Pérez", "Javier González Ruiz"], "topic": "CNC_support", "priority": "urgent"}'::jsonb,
  now() - interval '3 hours',
  now() - interval '5 minutes'
);

-- Chat 2: Facturación resuelta (María ↔ Javier)
INSERT INTO chat_rooms (
  id,
  tipo,
  participants,
  request_id,
  is_active,
  metadata,
  created_at,
  updated_at
) VALUES (
  'chat-billing-maria-javier',
  'support',
  ARRAY[
    (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
    (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx')
  ],
  (SELECT id FROM requests WHERE titulo LIKE '%factura FAC-2024-001%'),
  true,
  '{"participant_names": ["María López Pérez", "Javier González Ruiz"], "topic": "billing_inquiry", "status": "resolved"}'::jsonb,
  now() - interval '5 days',
  now() - interval '2 days'
);

-- Chat 3: Consulta de ventas (Roberto ↔ Javier)
INSERT INTO chat_rooms (
  id,
  tipo,
  participants,
  request_id,
  is_active,
  metadata,
  created_at,
  updated_at
) VALUES (
  'chat-sales-roberto-javier',
  'sales',
  ARRAY[
    (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'),
    (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx')
  ],
  (SELECT id FROM requests WHERE titulo LIKE '%productos de maquinado%'),
  true,
  '{"participant_names": ["Roberto García Vital", "Javier González Ruiz"], "topic": "product_inquiry", "budget": "50000-100000"}'::jsonb,
  now() - interval '2 days',
  now() - interval '1 hour'
);

-- =====================================================
-- 4. INSERTAR MENSAJES DE CHAT
-- =====================================================

-- Mensajes del Chat 1: Soporte técnico urgente
INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at) VALUES
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', '¡Hola! Tenemos un problema urgente con nuestro equipo CNC', 'text', now() - interval '3 hours'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Hola María, entiendo la urgencia. ¿Podrías contarme más detalles sobre el error E404?', 'text', now() - interval '2 hours 50 minutes'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', 'El error aparece cada 30 minutos aproximadamente, siempre durante operaciones de fresado', 'text', now() - interval '2 hours 45 minutes'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Entiendo. ¿Qué material están maquinando cuando ocurre el error?', 'text', now() - interval '2 hours 40 minutes'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', 'Aluminio 6061, piezas de 150x100x50mm', 'text', now() - interval '2 hours 35 minutes'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Perfecto. El error E404 en Haas suele estar relacionado con parámetros de velocidad. ¿Podrías enviarme los parámetros actuales?', 'text', now() - interval '2 hours 30 minutes'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', 'Claro, te envío el log de errores y los parámetros', 'text', now() - interval '2 hours 25 minutes'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Revisando los parámetros... veo que la velocidad de avance está muy alta para ese material. Te voy a enviar los parámetros corregidos', 'text', now() - interval '1 hour'),
('chat-support-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Programemos una sesión remota para mañana a las 10 AM para ajustar los parámetros directamente en el equipo', 'text', now() - interval '5 minutes');

-- Mensajes del Chat 2: Facturación resuelta
INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at) VALUES
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', 'Hola, tengo dudas sobre la factura FAC-2024-001', 'text', now() - interval '5 days'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Hola María, con gusto te ayudo. ¿Qué conceptos específicos te generan dudas?', 'text', now() - interval '4 days 23 hours'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', 'Veo cargos por "servicios adicionales" que no recuerdo haber solicitado', 'text', now() - interval '4 days 22 hours'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Déjame revisar tu cuenta. Los servicios adicionales corresponden a la calibración de emergencia del 15 de enero', 'text', now() - interval '4 days 20 hours'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', 'Ah sí, tienes razón. Pero el monto parece alto, ¿podrías verificarlo?', 'text', now() - interval '4 days 18 hours'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Efectivamente, hay un error en el cálculo. Te voy a generar una nota de crédito por la diferencia', 'text', now() - interval '4 days 16 hours'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'María López', '¡Perfecto! Muchas gracias por la rápida resolución', 'text', now() - interval '4 days 14 hours'),
('chat-billing-maria-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'De nada María. La nota de crédito ya está procesada. ¿Hay algo más en lo que pueda ayudarte?', 'text', now() - interval '2 days');

-- Mensajes del Chat 3: Consulta de ventas
INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at) VALUES
('chat-sales-roberto-javier', (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'), 'Roberto García', 'Hola, estoy interesado en herramientas de maquinado de precisión', 'text', now() - interval '2 days'),
('chat-sales-roberto-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Hola Roberto, excelente. ¿Qué tipo de materiales vas a maquinar principalmente?', 'text', now() - interval '2 days' + interval '10 minutes'),
('chat-sales-roberto-javier', (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'), 'Roberto García', 'Principalmente aluminio aeroespacial, algunas piezas de titanio ocasionalmente', 'text', now() - interval '2 days' + interval '15 minutes'),
('chat-sales-roberto-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Perfecto. Para esos materiales te recomiendo nuestra línea de herramientas con recubrimiento TiAlN', 'text', now() - interval '2 days' + interval '20 minutes'),
('chat-sales-roberto-javier', (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'), 'Roberto García', '¿Podrías enviarme especificaciones y precios?', 'text', now() - interval '2 days' + interval '25 minutes'),
('chat-sales-roberto-javier', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'Javier González', 'Claro, te estoy preparando una cotización personalizada con las herramientas más adecuadas para tu aplicación', 'text', now() - interval '1 hour');

-- =====================================================
-- 5. ACTUALIZAR LAST_MESSAGE EN CHAT_ROOMS
-- =====================================================

UPDATE chat_rooms SET 
  last_message = '{"id": "' || (SELECT id FROM messages WHERE chat_room_id = 'chat-support-maria-javier' ORDER BY created_at DESC LIMIT 1) || '", "message": "Programemos una sesión remota para mañana a las 10 AM para ajustar los parámetros directamente en el equipo", "sender_id": "' || (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx') || '", "sender_name": "Javier González", "created_at": "' || (now() - interval '5 minutes')::text || '", "type": "text"}'::jsonb,
  updated_at = now() - interval '5 minutes'
WHERE id = 'chat-support-maria-javier';

UPDATE chat_rooms SET 
  last_message = '{"id": "' || (SELECT id FROM messages WHERE chat_room_id = 'chat-billing-maria-javier' ORDER BY created_at DESC LIMIT 1) || '", "message": "De nada María. La nota de crédito ya está procesada. ¿Hay algo más en lo que pueda ayudarte?", "sender_id": "' || (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx') || '", "sender_name": "Javier González", "created_at": "' || (now() - interval '2 days')::text || '", "type": "text"}'::jsonb,
  updated_at = now() - interval '2 days'
WHERE id = 'chat-billing-maria-javier';

UPDATE chat_rooms SET 
  last_message = '{"id": "' || (SELECT id FROM messages WHERE chat_room_id = 'chat-sales-roberto-javier' ORDER BY created_at DESC LIMIT 1) || '", "message": "Claro, te estoy preparando una cotización personalizada con las herramientas más adecuadas para tu aplicación", "sender_id": "' || (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx') || '", "sender_name": "Javier González", "created_at": "' || (now() - interval '1 hour')::text || '", "type": "text"}'::jsonb,
  updated_at = now() - interval '1 hour'
WHERE id = 'chat-sales-roberto-javier';

-- =====================================================
-- 6. INSERTAR NOTIFICACIONES
-- =====================================================

-- Notificación 1: Solicitud actualizada para María (sin leer)
INSERT INTO notifications (
  user_id,
  title,
  body,
  type,
  priority,
  data,
  read,
  created_at
) VALUES (
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  'Solicitud actualizada',
  'Tu solicitud "Equipo CNC con errores E404" cambió a: En proceso',
  'request_update',
  'high',
  '{"request_id": "' || (SELECT id FROM requests WHERE titulo LIKE '%CNC con errores E404%') || '", "new_status": "en_proceso", "agent": "Javier González"}'::jsonb,
  false,
  now() - interval '30 minutes'
);

-- Notificación 2: Nuevo mensaje para María (sin leer)
INSERT INTO notifications (
  user_id,
  title,
  body,
  type,
  priority,
  data,
  read,
  created_at
) VALUES (
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  'Nuevo mensaje de Javier González',
  'Te ha enviado un mensaje sobre tu solicitud de soporte técnico',
  'new_message',
  'medium',
  '{"chat_room_id": "chat-support-maria-javier", "sender": "Javier González"}'::jsonb,
  false,
  now() - interval '5 minutes'
);

-- Notificación 3: Nueva asignación para Javier (sin leer)
INSERT INTO notifications (
  user_id,
  title,
  body,
  type,
  priority,
  data,
  read,
  created_at
) VALUES (
  (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'),
  'Nueva solicitud asignada',
  'Se te ha asignado la solicitud: "Información sobre productos de maquinado de precisión"',
  'assignment',
  'medium',
  '{"request_id": "' || (SELECT id FROM requests WHERE titulo LIKE '%productos de maquinado%') || '", "customer": "Roberto García"}'::jsonb,
  false,
  now() - interval '1 day'
);

-- Notificación 4: Solicitud resuelta para María (leída)
INSERT INTO notifications (
  user_id,
  title,
  body,
  type,
  priority,
  data,
  read,
  read_at,
  created_at
) VALUES (
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  'Solicitud resuelta',
  'Tu consulta sobre facturación ha sido resuelta satisfactoriamente',
  'request_update',
  'medium',
  '{"request_id": "' || (SELECT id FROM requests WHERE titulo LIKE '%factura FAC-2024-001%') || '", "resolution": "credit_note_issued"}'::jsonb,
  true,
  now() - interval '2 days',
  now() - interval '2 days 2 hours'
);

-- Notificación 5: Reporte diario para Admin (sin leer)
INSERT INTO notifications (
  user_id,
  title,
  body,
  type,
  priority,
  data,
  read,
  created_at
) VALUES (
  (SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'),
  'Reporte diario del sistema',
  '5 solicitudes activas, 89% de satisfacción del cliente, 23 mensajes intercambiados',
  'system',
  'low',
  '{"active_requests": 5, "satisfaction_rate": 0.89, "messages_today": 23, "response_time_avg": "2.4h"}'::jsonb,
  false,
  now() - interval '8 hours'
);

-- =====================================================
-- 7. INSERTAR SESIONES DE CALCULADORA
-- =====================================================

-- Sesión 1: Barrenado Acero Inoxidable (María - Favorito)
INSERT INTO calculator_sessions (
  user_id,
  name,
  type,
  parameters,
  results,
  settings,
  is_favorite,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  'Barrenado Acero Inoxidable 316L',
  'barrenado',
  '{"D": 12, "Z": 2, "N": 1500, "Vc": 80, "fz": 0.15, "fn": 0.30, "Vf": 450, "Pb": 25, "Nb": 4}'::jsonb,
  '{"Tc": 0.22, "Q": 1.02, "efficiency": "high", "tool_life": "optimal"}'::jsonb,
  '{"units": "metric", "material": "stainless_steel_316L", "coolant": "flood"}'::jsonb,
  true,
  now() - interval '3 days',
  now() - interval '3 days'
);

-- Sesión 2: Fresado Aluminio (María - Favorito)
INSERT INTO calculator_sessions (
  user_id,
  name,
  type,
  parameters,
  results,
  settings,
  is_favorite,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'cliente@gmail.com'),
  'Fresado Aluminio 6061',
  'fresado',
  '{"D": 20, "Z": 4, "N": 2000, "Vc": 200, "fz": 0.25, "fn": 1.0, "Vf": 2000, "ap": 5, "ae": 15, "Np": 3, "Lm": 150}'::jsonb,
  '{"Tc": 0.15, "Q": 150, "surface_finish": "excellent", "tool_wear": "minimal"}'::jsonb,
  '{"units": "metric", "material": "aluminum_6061", "coolant": "mist"}'::jsonb,
  true,
  now() - interval '1 week',
  now() - interval '1 week'
);

-- Sesión 3: Barrenado Aluminio (Roberto)
INSERT INTO calculator_sessions (
  user_id,
  name,
  type,
  parameters,
  results,
  settings,
  is_favorite,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'),
  'Barrenado Aluminio Estándar',
  'barrenado',
  '{"D": 8, "Z": 2, "N": 2500, "Vc": 120, "fz": 0.12, "fn": 0.24, "Vf": 600, "Pb": 20, "Nb": 6}'::jsonb,
  '{"Tc": 0.15, "Q": 0.72, "efficiency": "good", "tool_life": "standard"}'::jsonb,
  '{"units": "metric", "material": "aluminum_standard", "coolant": "air"}'::jsonb,
  false,
  now() - interval '2 days',
  now() - interval '2 days'
);

-- =====================================================
-- 8. INSERTAR PLANTILLAS PÚBLICAS
-- =====================================================

-- Plantilla 1: Acero Inoxidable - Barrenado
INSERT INTO calculator_templates (
  name,
  description,
  type,
  parameters,
  is_public,
  created_by,
  created_at
) VALUES (
  'Acero Inoxidable 316L - Barrenado',
  'Parámetros optimizados para barrenado en acero inoxidable 316L con herramientas de carburo',
  'barrenado',
  '{"D": 10, "Z": 2, "Vc": 80, "fz": 0.15, "material": "stainless_steel_316L", "tool_type": "carbide_tin_coated", "coolant": "flood"}'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'),
  now() - interval '1 month'
);

-- Plantilla 2: Aluminio - Fresado
INSERT INTO calculator_templates (
  name,
  description,
  type,
  parameters,
  is_public,
  created_by,
  created_at
) VALUES (
  'Aluminio 6061 - Fresado',
  'Configuración estándar para fresado de aluminio 6061 con refrigerante',
  'fresado',
  '{"D": 16, "Z": 4, "Vc": 200, "fz": 0.25, "material": "aluminum_6061", "tool_type": "carbide_uncoated", "coolant": "flood"}'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'),
  now() - interval '3 weeks'
);

-- Plantilla 3: Acero al Carbón - Barrenado
INSERT INTO calculator_templates (
  name,
  description,
  type,
  parameters,
  is_public,
  created_by,
  created_at
) VALUES (
  'Acero al Carbón - Barrenado',
  'Parámetros conservadores para acero al carbón con herramientas HSS',
  'barrenado',
  '{"D": 12, "Z": 2, "Vc": 60, "fz": 0.12, "material": "carbon_steel", "tool_type": "hss_uncoated", "coolant": "soluble_oil"}'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'),
  now() - interval '2 weeks'
);

-- =====================================================
-- 9. INSERTAR LOGS DE ACTIVIDAD
-- =====================================================

INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at) VALUES
((SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'login', 'user', (SELECT id FROM users WHERE email = 'cliente@gmail.com'), '{"ip": "192.168.1.100", "user_agent": "ELMEC Mobile App 1.0.0"}'::jsonb, now() - interval '2 hours'),
((SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'request_status_update', 'request', (SELECT id FROM requests WHERE titulo LIKE '%CNC con errores E404%'), '{"old_status": "asignado", "new_status": "en_proceso"}'::jsonb, now() - interval '30 minutes'),
((SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'message_sent', 'chat', 'chat-support-maria-javier', '{"message_type": "text", "chat_type": "support"}'::jsonb, now() - interval '5 minutes'),
((SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'), 'request_created', 'request', (SELECT id FROM requests WHERE titulo LIKE '%productos de maquinado%'), '{"type": "product_inquiry", "priority": "media"}'::jsonb, now() - interval '2 days'),
((SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'login', 'user', (SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), '{"ip": "10.0.0.50", "user_agent": "ELMEC Mobile App 1.0.0"}'::jsonb, now() - interval '1 hour'),
((SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'), 'system_metrics_view', 'dashboard', null, '{"metrics_viewed": ["user_stats", "request_stats", "chat_stats"]}'::jsonb, now() - interval '8 hours'),
((SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'calculator_session_saved', 'calculator', (SELECT id FROM calculator_sessions WHERE name = 'Barrenado Acero Inoxidable 316L'), '{"type": "barrenado", "marked_favorite": true}'::jsonb, now() - interval '3 days');

-- =====================================================
-- 10. INSERTAR MÉTRICAS DEL SISTEMA
-- =====================================================

INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags, recorded_at) VALUES
('active_users_daily', 156, 'counter', '{"period": "24h", "type": "user_activity"}'::jsonb, now() - interval '1 hour'),
('requests_created_daily', 12, 'counter', '{"period": "24h", "type": "request_activity"}'::jsonb, now() - interval '1 hour'),
('messages_sent_daily', 89, 'counter', '{"period": "24h", "type": "chat_activity"}'::jsonb, now() - interval '1 hour'),
('avg_response_time_hours', 2.4, 'gauge', '{"unit": "hours", "type": "performance"}'::jsonb, now() - interval '1 hour'),
('customer_satisfaction_rate', 4.6, 'gauge', '{"scale": "1-5", "type": "quality"}'::jsonb, now() - interval '1 hour'),
('system_uptime_percentage', 99.8, 'gauge', '{"unit": "percentage", "type": "reliability"}'::jsonb, now() - interval '1 hour');

-- =====================================================
-- 11. INSERTAR TOKENS PUSH (DEMO)
-- =====================================================

INSERT INTO push_tokens (user_id, token, platform, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'cliente@gmail.com'), 'ExponentPushToken[demo-maria-lopez-token]', 'ios', true, now() - interval '1 day', now()),
((SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), 'ExponentPushToken[demo-javier-gonzalez-token]', 'android', true, now() - interval '2 days', now()),
((SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'), 'ExponentPushToken[demo-roberto-garcia-token]', 'web', true, now() - interval '3 days', now()),
((SELECT id FROM users WHERE email = 'i.pineda@elmec.com.mx'), 'ExponentPushToken[demo-ivan-pineda-token]', 'ios', true, now() - interval '1 week', now());

-- =====================================================
-- 12. INSERTAR SESIONES DE USUARIO
-- =====================================================

INSERT INTO user_sessions (user_id, session_start, session_end, duration, pages_visited, actions_performed, device_info, ip_address, user_agent, created_at) VALUES
((SELECT id FROM users WHERE email = 'cliente@gmail.com'), now() - interval '2 hours', now() - interval '1 hour 30 minutes', 1800, ARRAY['home', 'requests', 'chat', 'calculator'], '{"requests_viewed": 3, "messages_sent": 5, "calculations_performed": 2}'::jsonb, '{"platform": "ios", "version": "17.2", "device": "iPhone 14"}'::jsonb, '192.168.1.100'::inet, 'ELMEC Mobile App 1.0.0 (iOS)', now() - interval '2 hours'),
((SELECT id FROM users WHERE email = 'j.gonzalez@elmec.com.mx'), now() - interval '1 hour', now() - interval '10 minutes', 3000, ARRAY['home', 'requests', 'chat', 'directory', 'profile'], '{"requests_updated": 2, "messages_sent": 8, "users_contacted": 3}'::jsonb, '{"platform": "android", "version": "14", "device": "Samsung Galaxy S23"}'::jsonb, '10.0.0.50'::inet, 'ELMEC Mobile App 1.0.0 (Android)', now() - interval '1 hour'),
((SELECT id FROM users WHERE email = 'rgarciavital@gmail.com'), now() - interval '1 day', now() - interval '23 hours', 3600, ARRAY['home', 'directory', 'requests', 'calculator'], '{"requests_created": 1, "contacts_viewed": 5, "calculations_performed": 1}'::jsonb, '{"platform": "web", "browser": "Chrome", "version": "120"}'::jsonb, '203.0.113.1'::inet, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', now() - interval '1 day');

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 ¡DATOS DEMO INSERTADOS EXITOSAMENTE!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '👥 Usuarios actualizados: 4';
  RAISE NOTICE '📋 Solicitudes creadas: 5';
  RAISE NOTICE '💬 Chats creados: 3';
  RAISE NOTICE '📨 Mensajes insertados: 23';
  RAISE NOTICE '🔔 Notificaciones creadas: 5';
  RAISE NOTICE '🧮 Sesiones de calculadora: 3';
  RAISE NOTICE '📚 Plantillas públicas: 3';
  RAISE NOTICE '📊 Logs de actividad: 7';
  RAISE NOTICE '📈 Métricas del sistema: 6';
  RAISE NOTICE '📱 Tokens push: 4';
  RAISE NOTICE '⏱️ Sesiones de usuario: 3';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🚀 La aplicación está lista para demo completo';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 CREDENCIALES DE ACCESO:';
  RAISE NOTICE '👑 Admin: i.pineda@elmec.com.mx / password';
  RAISE NOTICE '🛠️ Soporte: j.gonzalez@elmec.com.mx / password';
  RAISE NOTICE '👤 Cliente 1: cliente@gmail.com / password';
  RAISE NOTICE '👤 Cliente 2: rgarciavital@gmail.com / password';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ejecuta: npm run validate-demo para verificar';
END $$;