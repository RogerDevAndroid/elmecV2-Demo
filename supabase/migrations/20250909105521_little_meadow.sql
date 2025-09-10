/*
  # Inserción completa de datos demo para ELMEC

  Este script inserta datos de demostración para todas las funcionalidades:
  
  1. Usuarios demo (admin, agentes, clientes)
  2. Solicitudes de ejemplo con diferentes estados
  3. Salas de chat y conversaciones
  4. Mensajes de chat realistas
  5. Notificaciones de ejemplo
  6. Sesiones de calculadora guardadas
  7. Plantillas de calculadora
  8. Logs de actividad
  9. Métricas del sistema

  IMPORTANTE: Los usuarios deben existir primero en auth.users
*/

-- ============================================================================
-- 1. COMPLETAR DATOS DE USUARIOS EXISTENTES
-- ============================================================================

-- Actualizar datos completos para usuarios existentes
UPDATE users SET
  empresa = 'ELMEC Corporativo',
  nombre = 'Ivan',
  apellido_paterno = 'Pineda',
  apellido_materno = 'Rodriguez',
  correo_electronico = 'i.pineda@elmec.com.mx',
  celular = '+52 81 1234 5678',
  ciudad = 'Monterrey',
  estado = 'Nuevo León',
  rol = 'admin',
  categoria = 'Administración',
  zona = 'Corporativo',
  activo = true,
  is_online = true,
  last_seen = now(),
  last_login = now(),
  metadata = '{"department": "IT", "level": "senior", "permissions": ["all"]}'::jsonb,
  updated_at = now()
WHERE email = 'i.pineda@elmec.com.mx';

UPDATE users SET
  empresa = 'ELMEC Soporte',
  nombre = 'Javier',
  apellido_paterno = 'González',
  apellido_materno = 'Ruiz',
  correo_electronico = 'j.gonzalez@elmec.com.mx',
  celular = '+52 81 2345 6789',
  ciudad = 'Guadalajara',
  estado = 'Jalisco',
  rol = 'agent',
  categoria = 'Soporte Técnico',
  zona = 'Centro',
  activo = true,
  is_online = true,
  last_seen = now() - interval '5 minutes',
  last_login = now() - interval '2 hours',
  metadata = '{"specialties": ["CNC", "CAD"], "experience": "5 years"}'::jsonb,
  updated_at = now()
WHERE email = 'j.gonzalez@elmec.com.mx';

UPDATE users SET
  empresa = 'Empresa Industrial SA',
  nombre = 'María',
  apellido_paterno = 'López',
  apellido_materno = 'Pérez',
  correo_electronico = 'cliente@gmail.com',
  celular = '+52 55 3456 7890',
  ciudad = 'Ciudad de México',
  estado = 'CDMX',
  rol = 'customer',
  categoria = null,
  zona = null,
  activo = true,
  is_online = false,
  last_seen = now() - interval '1 hour',
  last_login = now() - interval '3 hours',
  metadata = '{"company_size": "medium", "industry": "manufacturing"}'::jsonb,
  updated_at = now()
WHERE email = 'cliente@gmail.com';

UPDATE users SET
  empresa = 'Desarrollo Personal',
  nombre = 'Roberto',
  apellido_paterno = 'García',
  apellido_materno = 'Vital',
  correo_electronico = 'rgarciavital@gmail.com',
  celular = '+52 33 4567 8901',
  ciudad = 'Tijuana',
  estado = 'Baja California',
  rol = 'customer',
  categoria = null,
  zona = null,
  activo = true,
  is_online = false,
  last_seen = now() - interval '2 days',
  last_login = now() - interval '1 week',
  metadata = '{"company_size": "small", "industry": "services"}'::jsonb,
  updated_at = now()
WHERE email = 'rgarciavital@gmail.com';

-- ============================================================================
-- 2. INSERTAR USUARIOS ADICIONALES PARA DEMO
-- ============================================================================

-- Solo insertar si no existen (evitar duplicados)
INSERT INTO users (id, email, empresa, nombre, apellido_paterno, apellido_materno, correo_electronico, celular, ciudad, estado, rol, categoria, zona, activo, is_online, last_seen, metadata)
SELECT 
  gen_random_uuid(),
  'carlos.mendoza@elmec.com.mx',
  'ELMEC Ventas',
  'Carlos',
  'Mendoza',
  'Silva',
  'carlos.mendoza@elmec.com.mx',
  '+52 81 5678 9012',
  'Monterrey',
  'Nuevo León',
  'agent',
  'Agentes de venta',
  'Norte',
  true,
  true,
  now() - interval '10 minutes',
  '{"specialties": ["sales", "customer_relations"], "experience": "3 years"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carlos.mendoza@elmec.com.mx');

INSERT INTO users (id, email, empresa, nombre, apellido_paterno, apellido_materno, correo_electronico, celular, ciudad, estado, rol, categoria, zona, activo, is_online, last_seen, metadata)
SELECT 
  gen_random_uuid(),
  'ana.garcia@elmec.com.mx',
  'ELMEC Servicio',
  'Ana',
  'García',
  'Morales',
  'ana.garcia@elmec.com.mx',
  '+52 33 6789 0123',
  'Guadalajara',
  'Jalisco',
  'agent',
  'Servicio al Cliente',
  'Centro',
  true,
  false,
  now() - interval '30 minutes',
  '{"specialties": ["customer_service", "billing"], "experience": "4 years"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ana.garcia@elmec.com.mx');

INSERT INTO users (id, email, empresa, nombre, apellido_paterno, apellido_materno, correo_electronico, celular, ciudad, estado, rol, categoria, zona, activo, is_online, last_seen, metadata)
SELECT 
  gen_random_uuid(),
  'luis.ramirez@elmec.com.mx',
  'ELMEC Ventas',
  'Luis',
  'Ramírez',
  'Torres',
  'luis.ramirez@elmec.com.mx',
  '+52 55 7890 1234',
  'Ciudad de México',
  'CDMX',
  'agent',
  'Agentes de venta',
  'Sur',
  true,
  true,
  now() - interval '2 minutes',
  '{"specialties": ["industrial_sales", "technical_consulting"], "experience": "6 years"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'luis.ramirez@elmec.com.mx');

INSERT INTO users (id, email, empresa, nombre, apellido_paterno, apellido_materno, correo_electronico, celular, ciudad, estado, rol, categoria, zona, activo, is_online, last_seen, metadata)
SELECT 
  gen_random_uuid(),
  'cliente2@empresa.com',
  'Manufacturas del Norte SA',
  'Pedro',
  'Martínez',
  'Hernández',
  'cliente2@empresa.com',
  '+52 81 8901 2345',
  'Monterrey',
  'Nuevo León',
  'customer',
  null,
  null,
  true,
  false,
  now() - interval '4 hours',
  '{"company_size": "large", "industry": "automotive"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'cliente2@empresa.com');

-- ============================================================================
-- 3. INSERTAR SOLICITUDES DE EJEMPLO
-- ============================================================================

-- Variables para IDs de usuarios (usando los emails conocidos)
DO $$
DECLARE
  admin_id uuid;
  javier_id uuid;
  carlos_id uuid;
  ana_id uuid;
  luis_id uuid;
  maria_id uuid;
  pedro_id uuid;
  roberto_id uuid;
  req1_id uuid;
  req2_id uuid;
  req3_id uuid;
  req4_id uuid;
  req5_id uuid;
  chat1_id uuid;
  chat2_id uuid;
  chat3_id uuid;
BEGIN
  -- Obtener IDs de usuarios
  SELECT id INTO admin_id FROM users WHERE email = 'i.pineda@elmec.com.mx';
  SELECT id INTO javier_id FROM users WHERE email = 'j.gonzalez@elmec.com.mx';
  SELECT id INTO carlos_id FROM users WHERE email = 'carlos.mendoza@elmec.com.mx';
  SELECT id INTO ana_id FROM users WHERE email = 'ana.garcia@elmec.com.mx';
  SELECT id INTO luis_id FROM users WHERE email = 'luis.ramirez@elmec.com.mx';
  SELECT id INTO maria_id FROM users WHERE email = 'cliente@gmail.com';
  SELECT id INTO pedro_id FROM users WHERE email = 'cliente2@empresa.com';
  SELECT id INTO roberto_id FROM users WHERE email = 'rgarciavital@gmail.com';

  -- Insertar solicitudes de ejemplo
  INSERT INTO requests (id, titulo, mensaje, tipo, prioridad, estatus, usuario_id, agente_id, fecha_vencimiento, tags, metadata, created_at, updated_at)
  VALUES 
    (
      gen_random_uuid(),
      'Soporte técnico urgente - Equipo CNC con errores',
      'Nuestro equipo CNC modelo XYZ-2000 está presentando errores constantes en el sistema de control. Los códigos de error que aparecen son E001 y E045. Necesitamos asistencia técnica urgente ya que está afectando la producción.',
      1,
      'urgente',
      'en_proceso',
      maria_id,
      javier_id,
      now() + interval '2 days',
      ARRAY['CNC', 'urgente', 'producción'],
      '{"equipment": "XYZ-2000", "error_codes": ["E001", "E045"], "impact": "production_stopped"}'::jsonb,
      now() - interval '2 hours',
      now() - interval '30 minutes'
    ),
    (
      gen_random_uuid(),
      'Consulta sobre facturación - Cargos adicionales',
      'Hemos recibido una factura con cargos adicionales que no entendemos. Necesitamos una explicación detallada de los conceptos facturados en el período de marzo 2024.',
      2,
      'media',
      'resuelto',
      maria_id,
      ana_id,
      now() + interval '5 days',
      ARRAY['facturación', 'consulta'],
      '{"invoice_period": "2024-03", "amount_disputed": 15000}'::jsonb,
      now() - interval '3 days',
      now() - interval '1 day'
    ),
    (
      gen_random_uuid(),
      'Información sobre nuevos productos de fresado',
      'Estamos interesados en conocer más sobre sus nuevas líneas de productos para fresado. Específicamente necesitamos información sobre herramientas para aluminio y acero inoxidable.',
      3,
      'baja',
      'asignado',
      pedro_id,
      carlos_id,
      now() + interval '7 days',
      ARRAY['productos', 'fresado', 'ventas'],
      '{"products_interest": ["milling_tools", "aluminum", "stainless_steel"]}'::jsonb,
      now() - interval '1 day',
      now() - interval '6 hours'
    ),
    (
      gen_random_uuid(),
      'Queja sobre tiempo de respuesta en soporte',
      'Hemos tenido varias experiencias negativas con los tiempos de respuesta del equipo de soporte. Las solicitudes tardan más de 48 horas en ser atendidas, lo cual es inaceptable para nuestras operaciones.',
      4,
      'alta',
      'nuevo',
      roberto_id,
      null,
      now() + interval '3 days',
      ARRAY['queja', 'tiempo_respuesta', 'soporte'],
      '{"complaint_type": "response_time", "previous_tickets": 3}'::jsonb,
      now() - interval '6 hours',
      now() - interval '6 hours'
    ),
    (
      gen_random_uuid(),
      'Sugerencia para mejorar la aplicación móvil',
      'Me gustaría sugerir algunas mejoras para la aplicación móvil: 1) Notificaciones push más detalladas, 2) Modo offline para la calculadora, 3) Exportar resultados de cálculos a PDF.',
      5,
      'baja',
      'asignado',
      maria_id,
      admin_id,
      now() + interval '14 days',
      ARRAY['sugerencia', 'app_móvil', 'mejoras'],
      '{"suggestions": ["push_notifications", "offline_mode", "pdf_export"]}'::jsonb,
      now() - interval '12 hours',
      now() - interval '8 hours'
    );

  -- Obtener IDs de las solicitudes recién creadas para crear chats
  SELECT id INTO req1_id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' AND usuario_id = maria_id;
  SELECT id INTO req2_id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' AND usuario_id = maria_id;
  SELECT id INTO req3_id FROM requests WHERE titulo LIKE 'Información sobre nuevos productos%' AND usuario_id = pedro_id;

  -- ============================================================================
  -- 4. INSERTAR SALAS DE CHAT
  -- ============================================================================

  -- Chat 1: María (cliente) con Javier (soporte técnico)
  INSERT INTO chat_rooms (id, tipo, participants, request_id, is_active, metadata, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'support',
    ARRAY[maria_id, javier_id],
    req1_id,
    true,
    jsonb_build_object(
      'participant_names', ARRAY['María López Pérez', 'Javier González Ruiz'],
      'request_title', 'Soporte técnico urgente - Equipo CNC con errores'
    ),
    now() - interval '2 hours',
    now() - interval '15 minutes'
  ) RETURNING id INTO chat1_id;

  -- Chat 2: María (cliente) con Ana (servicio al cliente)
  INSERT INTO chat_rooms (id, tipo, participants, request_id, is_active, metadata, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'support',
    ARRAY[maria_id, ana_id],
    req2_id,
    true,
    jsonb_build_object(
      'participant_names', ARRAY['María López Pérez', 'Ana García Morales'],
      'request_title', 'Consulta sobre facturación - Cargos adicionales'
    ),
    now() - interval '3 days',
    now() - interval '1 day'
  ) RETURNING id INTO chat2_id;

  -- Chat 3: Pedro (cliente) con Carlos (ventas)
  INSERT INTO chat_rooms (id, tipo, participants, request_id, is_active, metadata, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'sales',
    ARRAY[pedro_id, carlos_id],
    req3_id,
    true,
    jsonb_build_object(
      'participant_names', ARRAY['Pedro Martínez Hernández', 'Carlos Mendoza Silva'],
      'request_title', 'Información sobre nuevos productos de fresado'
    ),
    now() - interval '1 day',
    now() - interval '4 hours'
  ) RETURNING id INTO chat3_id;

  -- ============================================================================
  -- 5. INSERTAR MENSAJES DE CHAT REALISTAS
  -- ============================================================================

  -- Mensajes para Chat 1 (Soporte técnico urgente)
  INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at)
  VALUES 
    (chat1_id, maria_id, 'María López Pérez', '¡Hola! Tenemos un problema urgente con nuestro equipo CNC', 'text', now() - interval '2 hours'),
    (chat1_id, javier_id, 'Javier González Ruiz', 'Hola María, entiendo la urgencia. ¿Podrías decirme qué códigos de error están apareciendo?', 'text', now() - interval '1 hour 55 minutes'),
    (chat1_id, maria_id, 'María López Pérez', 'Los códigos son E001 y E045. Aparecen cada vez que intentamos iniciar un programa', 'text', now() - interval '1 hour 50 minutes'),
    (chat1_id, javier_id, 'Javier González Ruiz', 'Perfecto. E001 indica problema de calibración y E045 es un error de comunicación. ¿Cuándo fue la última vez que se hizo mantenimiento?', 'text', now() - interval '1 hour 45 minutes'),
    (chat1_id, maria_id, 'María López Pérez', 'El mantenimiento fue hace 3 semanas. Todo funcionaba bien hasta ayer', 'text', now() - interval '1 hour 40 minutes'),
    (chat1_id, javier_id, 'Javier González Ruiz', 'Entiendo. Voy a enviarte un procedimiento de diagnóstico. Mientras tanto, ¿podrías enviarme una foto del panel de control?', 'text', now() - interval '1 hour 35 minutes'),
    (chat1_id, maria_id, 'María López Pérez', 'Claro, te envío la foto ahora mismo', 'text', now() - interval '1 hour 30 minutes'),
    (chat1_id, javier_id, 'Javier González Ruiz', 'Perfecto. Basándome en los códigos de error, creo que necesitamos recalibrar los sensores. Te enviaré las instrucciones paso a paso.', 'text', now() - interval '20 minutes'),
    (chat1_id, maria_id, 'María López Pérez', '¡Excelente! Muchas gracias por la ayuda rápida', 'text', now() - interval '15 minutes');

  -- Mensajes para Chat 2 (Consulta facturación - RESUELTO)
  INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at)
  VALUES 
    (chat2_id, maria_id, 'María López Pérez', 'Hola Ana, tengo dudas sobre algunos cargos en mi factura de marzo', 'text', now() - interval '3 days'),
    (chat2_id, ana_id, 'Ana García Morales', 'Hola María, con gusto te ayudo. ¿Podrías especificar qué cargos te generan dudas?', 'text', now() - interval '2 days 23 hours'),
    (chat2_id, maria_id, 'María López Pérez', 'Hay un cargo por "Servicios adicionales" de $15,000 que no recuerdo haber solicitado', 'text', now() - interval '2 days 22 hours'),
    (chat2_id, ana_id, 'Ana García Morales', 'Déjame revisar tu cuenta. Ese cargo corresponde a la instalación y configuración del nuevo software CAD que solicitaste el 15 de marzo.', 'text', now() - interval '2 days 20 hours'),
    (chat2_id, maria_id, 'María López Pérez', 'Ah sí, tienes razón. Lo había olvidado. ¿Podrías enviarme el desglose detallado?', 'text', now() - interval '2 days 19 hours'),
    (chat2_id, ana_id, 'Ana García Morales', 'Por supuesto. Te envío el desglose por correo electrónico. ¿Hay algo más en lo que pueda ayudarte?', 'text', now() - interval '2 days 18 hours'),
    (chat2_id, maria_id, 'María López Pérez', 'No, eso era todo. Muchas gracias por la aclaración, Ana', 'text', now() - interval '2 days 17 hours'),
    (chat2_id, ana_id, 'Ana García Morales', '¡De nada! Cualquier duda adicional, no dudes en contactarme. ¡Que tengas un excelente día!', 'text', now() - interval '1 day');

  -- Mensajes para Chat 3 (Información productos)
  INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at)
  VALUES 
    (chat3_id, pedro_id, 'Pedro Martínez Hernández', 'Buenos días Carlos, estamos interesados en conocer sus nuevos productos para fresado', 'text', now() - interval '1 day'),
    (chat3_id, carlos_id, 'Carlos Mendoza Silva', '¡Buenos días Pedro! Me da mucho gusto saber de su interés. Tenemos excelentes novedades en herramientas de fresado', 'text', now() - interval '23 hours'),
    (chat3_id, carlos_id, 'Carlos Mendoza Silva', 'Específicamente para aluminio y acero inoxidable, tenemos la nueva línea ProCut que ha tenido resultados excepcionales', 'text', now() - interval '22 hours 55 minutes'),
    (chat3_id, pedro_id, 'Pedro Martínez Hernández', 'Suena interesante. ¿Podrían enviarme especificaciones técnicas y precios?', 'text', now() - interval '22 hours 30 minutes'),
    (chat3_id, carlos_id, 'Carlos Mendoza Silva', 'Por supuesto. Te preparo un catálogo completo con especificaciones, precios y casos de éxito. ¿Cuál es tu volumen de producción mensual?', 'text', now() - interval '4 hours'),
    (chat3_id, pedro_id, 'Pedro Martínez Hernández', 'Procesamos aproximadamente 500 piezas mensuales, principalmente en aluminio 6061', 'text', now() - interval '3 hours 30 minutes');

  -- Actualizar last_message en chat_rooms
  UPDATE chat_rooms SET 
    last_message = jsonb_build_object(
      'id', (SELECT id FROM messages WHERE chat_room_id = chat1_id ORDER BY created_at DESC LIMIT 1),
      'message', '¡Excelente! Muchas gracias por la ayuda rápida',
      'sender_id', maria_id,
      'sender_name', 'María López Pérez',
      'created_at', now() - interval '15 minutes',
      'type', 'text'
    ),
    updated_at = now() - interval '15 minutes'
  WHERE id = chat1_id;

  UPDATE chat_rooms SET 
    last_message = jsonb_build_object(
      'id', (SELECT id FROM messages WHERE chat_room_id = chat2_id ORDER BY created_at DESC LIMIT 1),
      'message', '¡De nada! Cualquier duda adicional, no dudes en contactarme. ¡Que tengas un excelente día!',
      'sender_id', ana_id,
      'sender_name', 'Ana García Morales',
      'created_at', now() - interval '1 day',
      'type', 'text'
    ),
    updated_at = now() - interval '1 day'
  WHERE id = chat2_id;

  UPDATE chat_rooms SET 
    last_message = jsonb_build_object(
      'id', (SELECT id FROM messages WHERE chat_room_id = chat3_id ORDER BY created_at DESC LIMIT 1),
      'message', 'Procesamos aproximadamente 500 piezas mensuales, principalmente en aluminio 6061',
      'sender_id', pedro_id,
      'sender_name', 'Pedro Martínez Hernández',
      'created_at', now() - interval '3 hours 30 minutes',
      'type', 'text'
    ),
    updated_at = now() - interval '3 hours 30 minutes'
  WHERE id = chat3_id;

  -- ============================================================================
  -- 6. INSERTAR NOTIFICACIONES
  -- ============================================================================

  INSERT INTO notifications (user_id, title, body, type, priority, data, read, created_at)
  VALUES 
    (maria_id, 'Solicitud actualizada', 'Tu solicitud "Soporte técnico urgente" está siendo procesada por Javier González', 'request_update', 'high', jsonb_build_object('request_id', req1_id), false, now() - interval '30 minutes'),
    (maria_id, 'Nuevo mensaje', 'Javier González te ha enviado un mensaje', 'new_message', 'medium', jsonb_build_object('chat_id', chat1_id), false, now() - interval '20 minutes'),
    (javier_id, 'Nueva solicitud asignada', 'Se te ha asignado la solicitud: Soporte técnico urgente - Equipo CNC con errores', 'assignment', 'high', jsonb_build_object('request_id', req1_id), false, now() - interval '2 hours'),
    (ana_id, 'Solicitud resuelta', 'Has marcado como resuelta la solicitud de María López sobre facturación', 'request_update', 'low', jsonb_build_object('request_id', req2_id), true, now() - interval '1 day'),
    (admin_id, 'Reporte diario', 'Resumen del día: 5 solicitudes nuevas, 3 resueltas, 89% satisfacción', 'system', 'low', jsonb_build_object('new_requests', 5, 'resolved', 3, 'satisfaction', 89), false, now() - interval '8 hours');

  -- ============================================================================
  -- 7. INSERTAR SESIONES DE CALCULADORA
  -- ============================================================================

  INSERT INTO calculator_sessions (user_id, name, type, parameters, results, settings, is_favorite, created_at, updated_at)
  VALUES 
    (maria_id, 'Barrenado Acero Inoxidable 316L', 'barrenado', 
     '{"D": 12, "Z": 2, "N": 1500, "Vc": 120, "fz": 0.15, "fn": 0.30, "Vf": 450, "Pb": 25, "Nb": 8}'::jsonb,
     '{"Tc": 4.44, "Q": 10.8}'::jsonb,
     '{"medida": "mt", "velocidad": "n"}'::jsonb,
     true, now() - interval '2 days', now() - interval '2 days'),
    
    (maria_id, 'Fresado Aluminio 6061', 'fresado',
     '{"D": 20, "Z": 4, "N": 2000, "Vc": 200, "fz": 0.12, "fn": 0.48, "Vf": 960, "ap": 5, "ae": 15, "Np": 3, "Lm": 100}'::jsonb,
     '{"Tc": 18.75, "Q": 72.0}'::jsonb,
     '{"medida": "mt", "velocidad": "n"}'::jsonb,
     true, now() - interval '1 day', now() - interval '1 day'),
    
    (pedro_id, 'Barrenado Aluminio Estándar', 'barrenado',
     '{"D": 8, "Z": 2, "N": 2500, "Vc": 150, "fz": 0.10, "fn": 0.20, "Vf": 500, "Pb": 15, "Nb": 12}'::jsonb,
     '{"Tc": 3.6, "Q": 6.28}'::jsonb,
     '{"medida": "mt", "velocidad": "n"}'::jsonb,
     false, now() - interval '3 hours', now() - interval '3 hours');

  -- ============================================================================
  -- 8. INSERTAR PLANTILLAS DE CALCULADORA
  -- ============================================================================

  INSERT INTO calculator_templates (name, description, type, parameters, is_public, created_by, created_at)
  VALUES 
    ('Acero Inoxidable 316L - Barrenado', 'Parámetros optimizados para barrenado en acero inoxidable 316L', 'barrenado',
     '{"D": 10, "Z": 2, "Vc": 120, "fz": 0.15}'::jsonb, true, admin_id, now() - interval '1 week'),
    
    ('Aluminio 6061 - Fresado', 'Configuración estándar para fresado de aluminio 6061', 'fresado',
     '{"D": 16, "Z": 4, "Vc": 200, "fz": 0.12, "ap": 4, "ae": 12}'::jsonb, true, admin_id, now() - interval '1 week'),
    
    ('Acero al Carbón - Barrenado', 'Parámetros para barrenado en acero al carbón AISI 1045', 'barrenado',
     '{"D": 8, "Z": 2, "Vc": 80, "fz": 0.10}'::jsonb, true, javier_id, now() - interval '3 days');

  -- ============================================================================
  -- 9. INSERTAR LOGS DE ACTIVIDAD
  -- ============================================================================

  INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at)
  VALUES 
    (maria_id, 'login', 'user', maria_id, '{"ip": "192.168.1.100", "device": "mobile"}'::jsonb, now() - interval '3 hours'),
    (maria_id, 'create_request', 'request', req1_id, '{"title": "Soporte técnico urgente", "priority": "urgente"}'::jsonb, now() - interval '2 hours'),
    (javier_id, 'login', 'user', javier_id, '{"ip": "192.168.1.101", "device": "desktop"}'::jsonb, now() - interval '2 hours'),
    (javier_id, 'update_request', 'request', req1_id, '{"status": "en_proceso", "previous_status": "asignado"}'::jsonb, now() - interval '1 hour'),
    (ana_id, 'resolve_request', 'request', req2_id, '{"status": "resuelto", "resolution_time": "2 days"}'::jsonb, now() - interval '1 day'),
    (carlos_id, 'send_message', 'message', null, '{"chat_id": "' || chat3_id || '", "message_type": "text"}'::jsonb, now() - interval '4 hours'),
    (admin_id, 'view_dashboard', 'system', null, '{"section": "analytics", "duration": 300}'::jsonb, now() - interval '1 hour');

  -- ============================================================================
  -- 10. INSERTAR MÉTRICAS DEL SISTEMA
  -- ============================================================================

  INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags, recorded_at)
  VALUES 
    ('active_users', 156, 'gauge', '{"period": "daily"}'::jsonb, now() - interval '1 hour'),
    ('total_requests', 342, 'counter', '{"period": "monthly"}'::jsonb, now() - interval '1 hour'),
    ('avg_response_time', 2.4, 'gauge', '{"unit": "hours"}'::jsonb, now() - interval '1 hour'),
    ('satisfaction_rate', 4.6, 'gauge', '{"scale": "1-5"}'::jsonb, now() - interval '1 hour'),
    ('messages_sent', 1247, 'counter', '{"period": "monthly"}'::jsonb, now() - interval '1 hour'),
    ('login_count', 89, 'counter', '{"period": "daily"}'::jsonb, now() - interval '1 hour');

  -- ============================================================================
  -- 11. INSERTAR TOKENS PUSH (DEMO)
  -- ============================================================================

  INSERT INTO push_tokens (user_id, token, platform, is_active, created_at, updated_at)
  VALUES 
    (maria_id, 'ExponentPushToken[demo-token-maria-123]', 'ios', true, now() - interval '1 day', now()),
    (javier_id, 'ExponentPushToken[demo-token-javier-456]', 'android', true, now() - interval '2 days', now()),
    (carlos_id, 'ExponentPushToken[demo-token-carlos-789]', 'ios', true, now() - interval '3 days', now());

  -- ============================================================================
  -- 12. INSERTAR SESIONES DE USUARIO
  -- ============================================================================

  INSERT INTO user_sessions (user_id, session_start, session_end, duration, pages_visited, actions_performed, device_info, ip_address, user_agent, created_at)
  VALUES 
    (maria_id, now() - interval '3 hours', now() - interval '1 hour', 7200, 
     ARRAY['/home', '/requests', '/chat', '/calculator'], 
     '{"requests_created": 1, "messages_sent": 5, "calculations": 2}'::jsonb,
     '{"platform": "ios", "version": "17.0", "device": "iPhone 14"}'::jsonb,
     '192.168.1.100'::inet,
     'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
     now() - interval '3 hours'),
    
    (javier_id, now() - interval '2 hours', null, null,
     ARRAY['/home', '/requests', '/chat'],
     '{"requests_processed": 3, "messages_sent": 8}'::jsonb,
     '{"platform": "web", "browser": "Chrome", "version": "120.0"}'::jsonb,
     '192.168.1.101'::inet,
     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
     now() - interval '2 hours');

END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Mostrar resumen de datos insertados
DO $$
BEGIN
  RAISE NOTICE '=== RESUMEN DE DATOS DEMO INSERTADOS ===';
  RAISE NOTICE 'Usuarios totales: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE 'Solicitudes: %', (SELECT COUNT(*) FROM requests);
  RAISE NOTICE 'Salas de chat: %', (SELECT COUNT(*) FROM chat_rooms);
  RAISE NOTICE 'Mensajes: %', (SELECT COUNT(*) FROM messages);
  RAISE NOTICE 'Notificaciones: %', (SELECT COUNT(*) FROM notifications);
  RAISE NOTICE 'Sesiones calculadora: %', (SELECT COUNT(*) FROM calculator_sessions);
  RAISE NOTICE 'Plantillas: %', (SELECT COUNT(*) FROM calculator_templates);
  RAISE NOTICE 'Logs actividad: %', (SELECT COUNT(*) FROM activity_logs);
  RAISE NOTICE 'Métricas sistema: %', (SELECT COUNT(*) FROM system_metrics);
  RAISE NOTICE '=== DATOS DEMO LISTOS PARA USAR ===';
END $$;