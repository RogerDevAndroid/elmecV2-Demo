/*
  # Insertar Datos Demo Completos - ELMEC

  Este script inserta datos demo completos para la aplicación ELMEC usando los usuarios existentes.
  
  1. Datos Demo Incluidos
     - Actualización de perfiles de usuarios existentes
     - 5 solicitudes de ejemplo con diferentes estados
     - 3 conversaciones de chat con historial
     - 23 mensajes intercambiados
     - 5 notificaciones de diferentes tipos
     - 3 sesiones de calculadora guardadas
     - 3 plantillas públicas
     - Logs de actividad y métricas del sistema

  2. Usuarios Demo
     - Admin: i.pineda@elmec.com.mx
     - Agente: j.gonzalez@elmec.com.mx  
     - Clientes: cliente@gmail.com, rgarciavital@gmail.com

  3. Escenarios de Prueba
     - Cliente con problema urgente de CNC
     - Agente atendiendo soporte técnico
     - Conversaciones de chat activas
     - Sistema de notificaciones funcionando
*/

-- Primero, obtener los IDs de los usuarios existentes
DO $$
DECLARE
    admin_id uuid;
    agent_id uuid;
    client1_id uuid;
    client2_id uuid;
    chat_room_1 uuid;
    chat_room_2 uuid;
    chat_room_3 uuid;
    request_1 uuid;
    request_2 uuid;
    request_3 uuid;
    request_4 uuid;
    request_5 uuid;
BEGIN
    -- Obtener IDs de usuarios existentes
    SELECT id INTO admin_id FROM users WHERE email = 'i.pineda@elmec.com.mx' LIMIT 1;
    SELECT id INTO agent_id FROM users WHERE email = 'j.gonzalez@elmec.com.mx' LIMIT 1;
    SELECT id INTO client1_id FROM users WHERE email = 'cliente@gmail.com' LIMIT 1;
    SELECT id INTO client2_id FROM users WHERE email = 'rgarciavital@gmail.com' LIMIT 1;

    -- Verificar que los usuarios existan
    IF admin_id IS NULL OR agent_id IS NULL OR client1_id IS NULL OR client2_id IS NULL THEN
        RAISE EXCEPTION 'No se encontraron todos los usuarios necesarios. Verifica que existan: i.pineda@elmec.com.mx, j.gonzalez@elmec.com.mx, cliente@gmail.com, rgarciavital@gmail.com';
    END IF;

    -- 1. ACTUALIZAR PERFILES DE USUARIOS EXISTENTES
    UPDATE users SET
        empresa = 'ELMEC',
        nombre = 'Ivan',
        apellido_paterno = 'Pineda',
        apellido_materno = 'Rodriguez',
        correo_electronico = 'i.pineda@elmec.com.mx',
        celular = '+52 81 1234 5678',
        ciudad = 'Monterrey',
        estado = 'Nuevo León',
        rol = 'admin',
        categoria = NULL,
        zona = NULL,
        activo = true,
        is_online = true,
        last_seen = now() - interval '5 minutes',
        last_login = now() - interval '2 hours',
        metadata = '{"department": "IT", "level": "senior"}'::jsonb,
        updated_at = now()
    WHERE id = admin_id;

    UPDATE users SET
        empresa = 'ELMEC',
        nombre = 'Javier',
        apellido_paterno = 'González',
        apellido_materno = 'Ruiz',
        correo_electronico = 'j.gonzalez@elmec.com.mx',
        celular = '+52 81 2345 6789',
        ciudad = 'Monterrey',
        estado = 'Nuevo León',
        rol = 'agent',
        categoria = 'Soporte Técnico',
        zona = 'Centro',
        activo = true,
        is_online = true,
        last_seen = now() - interval '10 minutes',
        last_login = now() - interval '1 hour',
        metadata = '{"specialization": "CNC", "experience": "5 years"}'::jsonb,
        updated_at = now()
    WHERE id = agent_id;

    UPDATE users SET
        empresa = 'Empresa Industrial SA',
        nombre = 'María',
        apellido_paterno = 'López',
        apellido_materno = 'Pérez',
        correo_electronico = 'cliente@gmail.com',
        celular = '+52 81 3456 7890',
        ciudad = 'Guadalajara',
        estado = 'Jalisco',
        rol = 'customer',
        categoria = NULL,
        zona = NULL,
        activo = true,
        is_online = true,
        last_seen = now() - interval '15 minutes',
        last_login = now() - interval '30 minutes',
        metadata = '{"company_size": "medium", "industry": "manufacturing"}'::jsonb,
        updated_at = now()
    WHERE id = client1_id;

    UPDATE users SET
        empresa = 'Desarrollo Personal',
        nombre = 'Roberto',
        apellido_paterno = 'García',
        apellido_materno = 'Vital',
        correo_electronico = 'rgarciavital@gmail.com',
        celular = '+52 81 4567 8901',
        ciudad = 'Ciudad de México',
        estado = 'CDMX',
        rol = 'customer',
        categoria = NULL,
        zona = NULL,
        activo = true,
        is_online = false,
        last_seen = now() - interval '2 hours',
        last_login = now() - interval '1 day',
        metadata = '{"company_size": "small", "industry": "consulting"}'::jsonb,
        updated_at = now()
    WHERE id = client2_id;

    -- 2. INSERTAR SOLICITUDES DEMO
    INSERT INTO requests (id, titulo, mensaje, tipo, prioridad, estatus, usuario_id, agente_id, fecha_vencimiento, archivos, tags, rating, feedback, metadata, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Soporte técnico urgente - Equipo CNC con errores', 'Nuestro equipo CNC principal está presentando errores de calibración y necesitamos asistencia técnica urgente. El equipo se detiene cada 30 minutos aproximadamente.', 1, 'urgente', 'en_proceso', client1_id, agent_id, now() + interval '2 days', ARRAY['manual_cnc.pdf', 'error_log.txt'], ARRAY['cnc', 'urgente', 'produccion'], NULL, NULL, '{"equipment": "CNC-2000", "error_code": "E404", "frequency": "every_30_min"}'::jsonb, now() - interval '3 hours', now() - interval '1 hour'),
    
    (gen_random_uuid(), 'Consulta sobre facturación del mes anterior', 'Tengo dudas sobre algunos cargos que aparecen en la factura del mes pasado. Podrían ayudarme a revisarla?', 2, 'media', 'resuelto', client1_id, agent_id, NULL, ARRAY['factura_marzo.pdf'], ARRAY['facturacion', 'consulta'], 5, 'Excelente atención, muy rápida la respuesta y clara la explicación.', '{"invoice_number": "FAC-2024-001", "amount": 15000, "resolved_amount": 12000}'::jsonb, now() - interval '2 days', now() - interval '1 day'),
    
    (gen_random_uuid(), 'Información sobre nuevos productos de maquinado', 'Estamos interesados en conocer más sobre sus nuevos productos para maquinado de precisión. Podrían enviarnos información detallada?', 3, 'media', 'asignado', client2_id, agent_id, now() + interval '5 days', ARRAY[], ARRAY['productos', 'ventas', 'maquinado'], NULL, NULL, '{"interest_level": "high", "budget_range": "50000-100000"}'::jsonb, now() - interval '1 day', now() - interval '6 hours'),
    
    (gen_random_uuid(), 'Queja sobre tiempo de respuesta', 'El tiempo de respuesta de soporte ha sido muy lento últimamente. Necesitamos mejorar este aspecto para nuestras operaciones.', 4, 'alta', 'nuevo', client2_id, NULL, now() + interval '3 days', ARRAY[], ARRAY['queja', 'soporte', 'tiempo'], NULL, NULL, '{"previous_tickets": 3, "avg_response_time": "48 hours"}'::jsonb, now() - interval '6 hours', now() - interval '6 hours'),
    
    (gen_random_uuid(), 'Sugerencia para mejorar la app móvil', 'Sería genial si pudieran agregar notificaciones push y mejorar la interfaz de la calculadora. También un modo oscuro estaría bien.', 5, 'baja', 'asignado', client1_id, admin_id, NULL, ARRAY[], ARRAY['sugerencia', 'app', 'mejoras'], NULL, NULL, '{"features_requested": ["push_notifications", "dark_mode", "calculator_ui"], "priority": "low"}'::jsonb, now() - interval '12 hours', now() - interval '8 hours');

    -- Obtener IDs de las solicitudes recién creadas para usar en chats
    SELECT id INTO request_1 FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' AND usuario_id = client1_id;
    SELECT id INTO request_2 FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' AND usuario_id = client1_id;
    SELECT id INTO request_3 FROM requests WHERE titulo LIKE 'Información sobre nuevos productos%' AND usuario_id = client2_id;

    -- 3. CREAR SALAS DE CHAT
    INSERT INTO chat_rooms (id, tipo, participants, request_id, is_active, last_message, metadata, created_at, updated_at) VALUES
    (gen_random_uuid(), 'support', ARRAY[client1_id, agent_id], request_1, true, NULL, '{"participant_names": ["María López Pérez", "Javier González Ruiz"], "topic": "Soporte CNC"}'::jsonb, now() - interval '3 hours', now() - interval '30 minutes'),
    
    (gen_random_uuid(), 'support', ARRAY[client1_id, agent_id], request_2, true, NULL, '{"participant_names": ["María López Pérez", "Javier González Ruiz"], "topic": "Facturación"}'::jsonb, now() - interval '2 days', now() - interval '1 day'),
    
    (gen_random_uuid(), 'sales', ARRAY[client2_id, agent_id], request_3, true, NULL, '{"participant_names": ["Roberto García Vital", "Javier González Ruiz"], "topic": "Información Productos"}'::jsonb, now() - interval '1 day', now() - interval '4 hours');

    -- Obtener IDs de las salas de chat
    SELECT id INTO chat_room_1 FROM chat_rooms WHERE request_id = request_1;
    SELECT id INTO chat_room_2 FROM chat_rooms WHERE request_id = request_2;
    SELECT id INTO chat_room_3 FROM chat_rooms WHERE request_id = request_3;

    -- 4. INSERTAR MENSAJES DE CHAT
    -- Chat 1: Soporte técnico urgente (9 mensajes)
    INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, read_by, reply_to, file_url, file_name, file_size, audio_duration, edited_at, is_deleted, created_at) VALUES
    (chat_room_1, client1_id, 'María López', 'Hola, tengo un problema urgente con nuestro equipo CNC', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '3 hours'),
    (chat_room_1, agent_id, 'Javier González', 'Hola María, entiendo que es urgente. ¿Podrías describir exactamente qué está pasando?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 hours 50 minutes'),
    (chat_room_1, client1_id, 'María López', 'El equipo se detiene cada 30 minutos con error E404', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 hours 45 minutes'),
    (chat_room_1, agent_id, 'Javier González', 'Ese error indica un problema de calibración. ¿Cuándo fue la última vez que se calibró?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 hours 40 minutes'),
    (chat_room_1, client1_id, 'María López', 'Hace aproximadamente 2 semanas', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 hours 35 minutes'),
    (chat_room_1, agent_id, 'Javier González', 'Perfecto. Te voy a enviar el manual de recalibración', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 hours 30 minutes'),
    (chat_room_1, agent_id, 'Javier González', 'Manual de calibración CNC-2000', 'file', '{}', NULL, 'https://example.com/manual.pdf', 'manual_calibracion.pdf', 2048000, NULL, NULL, false, now() - interval '2 hours 25 minutes'),
    (chat_room_1, client1_id, 'María López', 'Perfecto, ya lo descargué. ¿Podrías acompañarnos remotamente durante el proceso?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 hour'),
    (chat_room_1, agent_id, 'Javier González', 'Por supuesto, programemos una sesión para mañana a las 10 AM', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '30 minutes');

    -- Chat 2: Facturación resuelta (8 mensajes)
    INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, read_by, reply_to, file_url, file_name, file_size, audio_duration, edited_at, is_deleted, created_at) VALUES
    (chat_room_2, client1_id, 'María López', 'Hola, tengo dudas sobre mi factura del mes pasado', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days'),
    (chat_room_2, agent_id, 'Javier González', 'Hola María, con gusto te ayudo. ¿Podrías enviarme el número de factura?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days' + interval '5 minutes'),
    (chat_room_2, client1_id, 'María López', 'Es la factura FAC-2024-001 por $15,000', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days' + interval '10 minutes'),
    (chat_room_2, agent_id, 'Javier González', 'Déjame revisar... veo que hay un cargo adicional por servicio express', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days' + interval '15 minutes'),
    (chat_room_2, client1_id, 'María López', 'No recuerdo haber solicitado servicio express', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days' + interval '20 minutes'),
    (chat_room_2, agent_id, 'Javier González', 'Tienes razón, fue un error de facturación. Voy a procesar el ajuste', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days' + interval '25 minutes'),
    (chat_room_2, client1_id, 'María López', 'Perfecto, muchas gracias por la ayuda', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '2 days' + interval '30 minutes'),
    (chat_room_2, agent_id, 'Javier González', 'De nada, el ajuste ya está procesado. Recibirás la nota de crédito en 24 horas', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 day');

    -- Chat 3: Información de productos (6 mensajes)
    INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, read_by, reply_to, file_url, file_name, file_size, audio_duration, edited_at, is_deleted, created_at) VALUES
    (chat_room_3, client2_id, 'Roberto García', 'Buenos días, estoy interesado en sus productos de maquinado de precisión', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 day'),
    (chat_room_3, agent_id, 'Javier González', 'Buenos días Roberto! Me da mucho gusto saber de su interés. ¿Qué tipo de aplicación tienen en mente?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 day' + interval '10 minutes'),
    (chat_room_3, client2_id, 'Roberto García', 'Necesitamos equipos para maquinado de piezas de aluminio, principalmente fresado', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 day' + interval '20 minutes'),
    (chat_room_3, agent_id, 'Javier González', 'Excelente, tenemos varias opciones. ¿Cuál es el volumen de producción que manejan?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 day' + interval '30 minutes'),
    (chat_room_3, client2_id, 'Roberto García', 'Aproximadamente 500 piezas por mes', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '1 day' + interval '40 minutes'),
    (chat_room_3, agent_id, 'Javier González', 'Perfecto, les voy a preparar una cotización personalizada. ¿Podrían enviarme los planos de las piezas?', 'text', '{}', NULL, NULL, NULL, NULL, NULL, NULL, false, now() - interval '4 hours');

    -- 5. INSERTAR NOTIFICACIONES
    INSERT INTO notifications (user_id, title, body, type, priority, data, read, read_at, expired_at, created_at) VALUES
    (client1_id, 'Solicitud actualizada', 'Tu solicitud "Soporte técnico urgente" ha sido actualizada a estado: En proceso', 'request_update', 'high', '{"request_id": "' || request_1 || '", "new_status": "en_proceso"}'::jsonb, false, NULL, now() + interval '7 days', now() - interval '1 hour'),
    
    (client1_id, 'Nuevo mensaje de chat', 'Javier González te ha enviado un nuevo mensaje', 'new_message', 'medium', '{"chat_room_id": "' || chat_room_1 || '", "sender": "Javier González"}'::jsonb, false, NULL, now() + interval '3 days', now() - interval '30 minutes'),
    
    (agent_id, 'Nueva solicitud asignada', 'Se te ha asignado la solicitud: "Información sobre nuevos productos"', 'assignment', 'medium', '{"request_id": "' || request_3 || '", "client": "Roberto García"}'::jsonb, false, NULL, now() + interval '5 days', now() - interval '6 hours'),
    
    (agent_id, 'Solicitud resuelta', 'Has marcado como resuelta la solicitud de facturación de María López', 'request_update', 'low', '{"request_id": "' || request_2 || '", "action": "resolved"}'::jsonb, true, now() - interval '12 hours', NULL, now() - interval '1 day'),
    
    (admin_id, 'Reporte diario del sistema', 'Resumen diario: 5 solicitudes activas, 89% de satisfacción, 23 mensajes enviados', 'system', 'low', '{"active_requests": 5, "satisfaction": 89, "messages": 23}'::jsonb, false, NULL, now() + interval '1 day', now() - interval '8 hours');

    -- 6. INSERTAR SESIONES DE CALCULADORA
    INSERT INTO calculator_sessions (user_id, name, type, parameters, results, settings, is_favorite, created_at, updated_at) VALUES
    (client1_id, 'Barrenado Acero Inoxidable 316L', 'barrenado', '{"D": 12, "Z": 2, "N": 1500, "Vc": 80, "fz": 0.15, "fn": 0.30, "Vf": 450, "Pb": 25, "Nb": 4}'::jsonb, '{"Tc": 0.22, "Q": 1.02}'::jsonb, '{"material": "acero_inoxidable", "coating": "TiN"}'::jsonb, true, now() - interval '3 days', now() - interval '3 days'),
    
    (client1_id, 'Fresado Aluminio 6061', 'fresado', '{"D": 20, "Z": 4, "N": 2000, "Vc": 200, "fz": 0.25, "fn": 1.0, "Vf": 2000, "ap": 5, "ae": 15, "Np": 3, "Lm": 100}'::jsonb, '{"Tc": 0.15, "Q": 150}'::jsonb, '{"material": "aluminio", "coolant": "flood"}'::jsonb, true, now() - interval '1 day', now() - interval '1 day'),
    
    (client2_id, 'Barrenado Aluminio Estándar', 'barrenado', '{"D": 8, "Z": 2, "N": 2500, "Vc": 120, "fz": 0.12, "fn": 0.24, "Vf": 600, "Pb": 15, "Nb": 6}'::jsonb, '{"Tc": 0.15, "Q": 0.72}'::jsonb, '{"material": "aluminio", "coating": "uncoated"}'::jsonb, false, now() - interval '2 days', now() - interval '2 days');

    -- 7. INSERTAR PLANTILLAS PÚBLICAS
    INSERT INTO calculator_templates (name, description, type, parameters, is_public, created_by, created_at) VALUES
    ('Acero Inoxidable 316L - Barrenado', 'Parámetros optimizados para barrenado en acero inoxidable 316L con herramientas de carburo', 'barrenado', '{"D": 10, "Z": 2, "Vc": 80, "fz": 0.15, "material": "SS316L", "tool": "carbide"}'::jsonb, true, admin_id, now() - interval '1 week'),
    
    ('Aluminio 6061 - Fresado', 'Configuración estándar para fresado de aluminio 6061 con refrigerante', 'fresado', '{"D": 16, "Z": 4, "Vc": 200, "fz": 0.25, "material": "AL6061", "coolant": "flood"}'::jsonb, true, admin_id, now() - interval '5 days'),
    
    ('Acero al Carbón - Barrenado', 'Parámetros para barrenado en acero al carbón con herramientas HSS', 'barrenado', '{"D": 12, "Z": 2, "Vc": 60, "fz": 0.12, "material": "carbon_steel", "tool": "HSS"}'::jsonb, true, admin_id, now() - interval '3 days');

    -- 8. INSERTAR LOGS DE ACTIVIDAD
    INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES
    (client1_id, 'login', 'auth', client1_id, '{"method": "email", "success": true}'::jsonb, '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', now() - interval '30 minutes'),
    (agent_id, 'update_request_status', 'request', request_1, '{"old_status": "asignado", "new_status": "en_proceso"}'::jsonb, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', now() - interval '1 hour'),
    (client1_id, 'send_message', 'message', chat_room_1, '{"chat_room_id": "' || chat_room_1 || '", "message_type": "text"}'::jsonb, '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', now() - interval '30 minutes'),
    (client2_id, 'create_request', 'request', request_3, '{"title": "Información sobre productos", "priority": "media"}'::jsonb, '192.168.1.102', 'Mozilla/5.0 (Android 14; Mobile)', now() - interval '1 day'),
    (admin_id, 'view_dashboard', 'system', admin_id, '{"section": "analytics", "duration": 300}'::jsonb, '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', now() - interval '8 hours'),
    (agent_id, 'resolve_request', 'request', request_2, '{"resolution_time": 1440, "satisfaction": 5}'::jsonb, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', now() - interval '1 day'),
    (client1_id, 'use_calculator', 'calculator', NULL, '{"type": "barrenado", "session_saved": true}'::jsonb, '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', now() - interval '3 days');

    -- 9. INSERTAR MÉTRICAS DEL SISTEMA
    INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags, recorded_at) VALUES
    ('active_users_daily', 89, 'counter', '{"period": "24h", "type": "engagement"}'::jsonb, now() - interval '1 hour'),
    ('requests_created_daily', 12, 'counter', '{"period": "24h", "type": "requests"}'::jsonb, now() - interval '1 hour'),
    ('avg_response_time_hours', 2.4, 'gauge', '{"unit": "hours", "type": "performance"}'::jsonb, now() - interval '1 hour'),
    ('satisfaction_rate', 4.6, 'gauge', '{"scale": "1-5", "type": "quality"}'::jsonb, now() - interval '1 hour'),
    ('messages_sent_daily', 47, 'counter', '{"period": "24h", "type": "communication"}'::jsonb, now() - interval '1 hour'),
    ('login_success_rate', 98.5, 'gauge', '{"unit": "percentage", "type": "auth"}'::jsonb, now() - interval '1 hour');

    -- 10. ACTUALIZAR LAST_MESSAGE EN CHAT_ROOMS
    UPDATE chat_rooms SET 
        last_message = '{"id": "' || (SELECT id FROM messages WHERE chat_room_id = chat_room_1 ORDER BY created_at DESC LIMIT 1) || '", "message": "Por supuesto, programemos una sesión para mañana a las 10 AM", "sender_id": "' || agent_id || '", "sender_name": "Javier González", "created_at": "' || (now() - interval '30 minutes') || '", "type": "text"}'::jsonb,
        updated_at = now() - interval '30 minutes'
    WHERE id = chat_room_1;

    UPDATE chat_rooms SET 
        last_message = '{"id": "' || (SELECT id FROM messages WHERE chat_room_id = chat_room_2 ORDER BY created_at DESC LIMIT 1) || '", "message": "De nada, el ajuste ya está procesado. Recibirás la nota de crédito en 24 horas", "sender_id": "' || agent_id || '", "sender_name": "Javier González", "created_at": "' || (now() - interval '1 day') || '", "type": "text"}'::jsonb,
        updated_at = now() - interval '1 day'
    WHERE id = chat_room_2;

    UPDATE chat_rooms SET 
        last_message = '{"id": "' || (SELECT id FROM messages WHERE chat_room_id = chat_room_3 ORDER BY created_at DESC LIMIT 1) || '", "message": "Perfecto, les voy a preparar una cotización personalizada. ¿Podrían enviarme los planos de las piezas?", "sender_id": "' || agent_id || '", "sender_name": "Javier González", "created_at": "' || (now() - interval '4 hours') || '", "type": "text"}'::jsonb,
        updated_at = now() - interval '4 hours'
    WHERE id = chat_room_3;

    RAISE NOTICE '✅ Datos demo insertados exitosamente:';
    RAISE NOTICE '👥 Usuarios actualizados: 4';
    RAISE NOTICE '📋 Solicitudes creadas: 5';
    RAISE NOTICE '💬 Chats creados: 3';
    RAISE NOTICE '📨 Mensajes insertados: 23';
    RAISE NOTICE '🔔 Notificaciones creadas: 5';
    RAISE NOTICE '🧮 Sesiones de calculadora: 3';
    RAISE NOTICE '📚 Plantillas públicas: 3';
    RAISE NOTICE '📊 Logs de actividad: 7';
    RAISE NOTICE '📈 Métricas del sistema: 6';
    RAISE NOTICE '🎉 ¡Aplicación lista para demo completo!';

END $$;