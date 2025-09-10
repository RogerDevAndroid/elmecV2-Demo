/*
  # Insertar datos demo usando usuarios existentes

  Este script inserta datos demo utilizando los usuarios que ya existen en auth.users,
  evitando el error de foreign key constraint.

  1. Datos Demo
    - Solicitudes de ejemplo
    - Chats y mensajes
    - Notificaciones
    - Sesiones de calculadora
    - Plantillas públicas
    - Logs de actividad
    - Métricas del sistema

  2. Usuarios Existentes
    - Utiliza los IDs de usuarios que ya están en auth.users
    - No intenta crear nuevos usuarios
    - Actualiza perfiles existentes si es necesario
*/

-- Primero, actualizar los perfiles de usuarios existentes con datos demo
UPDATE users SET
  empresa = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'ELMEC Corporativo'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'ELMEC Soporte'
    WHEN email = 'cliente@gmail.com' THEN 'Empresa Industrial SA'
    WHEN email = 'rgarciavital@gmail.com' THEN 'Desarrollo Personal'
    ELSE empresa
  END,
  nombre = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'Ivan'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'Javier'
    WHEN email = 'cliente@gmail.com' THEN 'María'
    WHEN email = 'rgarciavital@gmail.com' THEN 'Roberto'
    ELSE nombre
  END,
  apellido_paterno = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'Pineda'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'González'
    WHEN email = 'cliente@gmail.com' THEN 'López'
    WHEN email = 'rgarciavital@gmail.com' THEN 'García'
    ELSE apellido_paterno
  END,
  apellido_materno = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'Rodriguez'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'Ruiz'
    WHEN email = 'cliente@gmail.com' THEN 'Pérez'
    WHEN email = 'rgarciavital@gmail.com' THEN 'Vital'
    ELSE apellido_materno
  END,
  correo_electronico = email,
  celular = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN '+52 55 1234 5678'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN '+52 55 2345 6789'
    WHEN email = 'cliente@gmail.com' THEN '+52 55 3456 7890'
    WHEN email = 'rgarciavital@gmail.com' THEN '+52 55 4567 8901'
    ELSE celular
  END,
  ciudad = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'Ciudad de México'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'Guadalajara'
    WHEN email = 'cliente@gmail.com' THEN 'Monterrey'
    WHEN email = 'rgarciavital@gmail.com' THEN 'Puebla'
    ELSE ciudad
  END,
  estado = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'CDMX'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'Jalisco'
    WHEN email = 'cliente@gmail.com' THEN 'Nuevo León'
    WHEN email = 'rgarciavital@gmail.com' THEN 'Puebla'
    ELSE estado
  END,
  rol = CASE 
    WHEN email = 'i.pineda@elmec.com.mx' THEN 'admin'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'agent'
    WHEN email = 'cliente@gmail.com' THEN 'customer'
    WHEN email = 'rgarciavital@gmail.com' THEN 'customer'
    ELSE rol
  END,
  categoria = CASE 
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'Soporte Técnico'
    ELSE categoria
  END,
  zona = CASE 
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN 'Centro'
    ELSE zona
  END,
  activo = true,
  is_online = CASE 
    WHEN email IN ('cliente@gmail.com', 'j.gonzalez@elmec.com.mx') THEN true
    ELSE false
  END,
  last_seen = now() - CASE 
    WHEN email = 'cliente@gmail.com' THEN interval '5 minutes'
    WHEN email = 'j.gonzalez@elmec.com.mx' THEN interval '2 minutes'
    WHEN email = 'i.pineda@elmec.com.mx' THEN interval '1 hour'
    ELSE interval '1 day'
  END,
  updated_at = now()
WHERE email IN ('i.pineda@elmec.com.mx', 'j.gonzalez@elmec.com.mx', 'cliente@gmail.com', 'rgarciavital@gmail.com');

-- Obtener IDs de usuarios existentes para usar en las relaciones
DO $$
DECLARE
    admin_id uuid;
    agent_id uuid;
    client_id uuid;
    client2_id uuid;
BEGIN
    -- Obtener IDs de usuarios existentes
    SELECT id INTO admin_id FROM users WHERE email = 'i.pineda@elmec.com.mx';
    SELECT id INTO agent_id FROM users WHERE email = 'j.gonzalez@elmec.com.mx';
    SELECT id INTO client_id FROM users WHERE email = 'cliente@gmail.com';
    SELECT id INTO client2_id FROM users WHERE email = 'rgarciavital@gmail.com';

    -- Solo continuar si encontramos los usuarios
    IF admin_id IS NOT NULL AND agent_id IS NOT NULL AND client_id IS NOT NULL THEN
        
        -- Limpiar datos existentes para evitar duplicados
        DELETE FROM activity_logs;
        DELETE FROM system_metrics;
        DELETE FROM notifications;
        DELETE FROM messages;
        DELETE FROM chat_rooms;
        DELETE FROM calculator_sessions;
        DELETE FROM calculator_templates;
        DELETE FROM requests;

        -- Insertar solicitudes demo
        INSERT INTO requests (id, titulo, mensaje, tipo, prioridad, estatus, usuario_id, agente_id, created_at, updated_at) VALUES
        (gen_random_uuid(), 'Soporte técnico urgente - Equipo CNC', 'Nuestro equipo CNC está presentando errores de calibración y necesitamos asistencia técnica inmediata. El error aparece al intentar ejecutar programas de barrenado.', 1, 'urgente', 'en_proceso', client_id, agent_id, now() - interval '2 hours', now() - interval '30 minutes'),
        (gen_random_uuid(), 'Consulta sobre facturación mensual', 'Tengo dudas sobre los cargos en mi factura del mes pasado. Aparecen conceptos que no reconozco y necesito una explicación detallada.', 2, 'media', 'resuelto', client_id, agent_id, now() - interval '1 day', now() - interval '2 hours'),
        (gen_random_uuid(), 'Información sobre nuevos productos', 'Estoy interesado en conocer más sobre sus nuevas líneas de productos para maquinado. Específicamente herramientas de corte.', 3, 'baja', 'asignado', client2_id, agent_id, now() - interval '3 days', now() - interval '1 day'),
        (gen_random_uuid(), 'Queja por tiempo de respuesta', 'El tiempo de respuesta en mis últimas solicitudes ha sido muy lento. Espero una mejora en el servicio.', 4, 'alta', 'nuevo', client2_id, NULL, now() - interval '1 day', now() - interval '1 day'),
        (gen_random_uuid(), 'Sugerencia para app móvil', 'Sería útil tener una función de calculadora offline en la app móvil para cuando no hay conexión a internet.', 5, 'media', 'asignado', client_id, admin_id, now() - interval '5 days', now() - interval '2 days');

        -- Insertar salas de chat
        INSERT INTO chat_rooms (id, tipo, participants, request_id, is_active, created_at, updated_at, metadata) VALUES
        (gen_random_uuid(), 'support', ARRAY[client_id, agent_id], (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1), true, now() - interval '2 hours', now() - interval '5 minutes', '{"participant_names": ["María López Pérez", "Javier González Ruiz"]}'),
        (gen_random_uuid(), 'support', ARRAY[client_id, agent_id], (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1), true, now() - interval '1 day', now() - interval '2 hours', '{"participant_names": ["María López Pérez", "Javier González Ruiz"]}'),
        (gen_random_uuid(), 'sales', ARRAY[client2_id, agent_id], (SELECT id FROM requests WHERE titulo LIKE 'Información sobre nuevos%' LIMIT 1), true, now() - interval '3 days', now() - interval '1 hour', '{"participant_names": ["Roberto García Vital", "Javier González Ruiz"]}');

        -- Insertar mensajes de chat
        -- Chat 1: Soporte técnico urgente (9 mensajes)
        INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at) VALUES
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), client_id, 'María López Pérez', 'Hola, tengo un problema urgente con nuestro equipo CNC', 'text', now() - interval '2 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Hola María, entiendo tu urgencia. ¿Podrías describir exactamente qué error estás viendo?', 'text', now() - interval '1 hour 55 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), client_id, 'María López Pérez', 'El equipo muestra "Error de calibración Z-axis" y no permite ejecutar ningún programa', 'text', now() - interval '1 hour 50 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Ese error indica un problema con el sensor de posición. ¿Has intentado recalibrar manualmente?', 'text', now() - interval '1 hour 45 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), client_id, 'María López Pérez', 'Sí, pero el proceso se interrumpe a la mitad', 'text', now() - interval '1 hour 40 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Perfecto, eso me ayuda a diagnosticar. Voy a enviarte un procedimiento específico', 'text', now() - interval '1 hour 35 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), client_id, 'María López Pérez', 'Excelente, estaré pendiente', 'text', now() - interval '1 hour 30 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Te envío el manual de recalibración por email. Síguelo paso a paso y me comentas', 'text', now() - interval '1 hour 25 minutes'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1)), client_id, 'María López Pérez', '¡Funcionó! Muchas gracias por tu ayuda rápida 👍', 'text', now() - interval '10 minutes');

        -- Chat 2: Facturación resuelta (8 mensajes)
        INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at) VALUES
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), client_id, 'María López Pérez', 'Hola, tengo dudas sobre mi factura del mes pasado', 'text', now() - interval '1 day'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Hola María, con gusto te ayudo. ¿Qué conceptos específicos te generan dudas?', 'text', now() - interval '23 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), client_id, 'María López Pérez', 'Aparece un cargo por "Servicios adicionales" que no recuerdo haber solicitado', 'text', now() - interval '22 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Déjame revisar tu cuenta. Ese cargo corresponde a la calibración especial que solicitaste el mes anterior', 'text', now() - interval '21 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), client_id, 'María López Pérez', 'Ah sí, tienes razón. Lo había olvidado', 'text', now() - interval '20 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'Te envío el detalle completo por email para tu referencia', 'text', now() - interval '19 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), client_id, 'María López Pérez', 'Perfecto, muchas gracias por la aclaración', 'text', now() - interval '18 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'support' AND request_id = (SELECT id FROM requests WHERE titulo LIKE 'Consulta sobre facturación%' LIMIT 1)), agent_id, 'Javier González Ruiz', 'De nada, cualquier otra duda no dudes en contactarme', 'text', now() - interval '17 hours');

        -- Chat 3: Ventas (6 mensajes)
        INSERT INTO messages (chat_room_id, sender_id, sender_name, message, type, created_at) VALUES
        ((SELECT id FROM chat_rooms WHERE tipo = 'sales' LIMIT 1), client2_id, 'Roberto García Vital', 'Hola, estoy interesado en sus productos de maquinado', 'text', now() - interval '3 days'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'sales' LIMIT 1), agent_id, 'Javier González Ruiz', 'Hola Roberto, excelente. ¿Qué tipo de aplicaciones tienes en mente?', 'text', now() - interval '2 days 23 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'sales' LIMIT 1), client2_id, 'Roberto García Vital', 'Principalmente barrenado en acero inoxidable y fresado de aluminio', 'text', now() - interval '2 days 22 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'sales' LIMIT 1), agent_id, 'Javier González Ruiz', 'Perfecto, tenemos excelentes opciones para esos materiales. Te envío nuestro catálogo especializado', 'text', now() - interval '2 days 21 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'sales' LIMIT 1), client2_id, 'Roberto García Vital', 'Gracias, también me interesa conocer sobre garantías y soporte técnico', 'text', now() - interval '2 days 20 hours'),
        ((SELECT id FROM chat_rooms WHERE tipo = 'sales' LIMIT 1), agent_id, 'Javier González Ruiz', 'Claro, ofrecemos garantía de 2 años y soporte técnico 24/7. ¿Te parece si programamos una llamada?', 'text', now() - interval '1 hour');

        -- Actualizar last_message en chat_rooms
        UPDATE chat_rooms SET 
          last_message = jsonb_build_object(
            'id', (SELECT id FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1),
            'message', (SELECT message FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1),
            'sender_id', (SELECT sender_id FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1),
            'sender_name', (SELECT sender_name FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1),
            'created_at', (SELECT created_at FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1),
            'type', (SELECT type FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1)
          ),
          updated_at = (SELECT created_at FROM messages WHERE chat_room_id = chat_rooms.id ORDER BY created_at DESC LIMIT 1)
        WHERE EXISTS (SELECT 1 FROM messages WHERE chat_room_id = chat_rooms.id);

        -- Insertar notificaciones
        INSERT INTO notifications (user_id, title, body, type, priority, read, created_at) VALUES
        (client_id, 'Solicitud actualizada', 'Tu solicitud de soporte técnico ha sido actualizada a "En proceso"', 'request_update', 'high', false, now() - interval '30 minutes'),
        (client_id, 'Nuevo mensaje', 'Tienes un nuevo mensaje de Javier González en tu chat de soporte', 'new_message', 'medium', false, now() - interval '10 minutes'),
        (agent_id, 'Nueva solicitud asignada', 'Se te ha asignado una nueva solicitud: "Queja por tiempo de respuesta"', 'assignment', 'medium', false, now() - interval '1 hour'),
        (agent_id, 'Solicitud resuelta', 'Has marcado como resuelta la solicitud de facturación de María López', 'request_update', 'low', true, now() - interval '2 hours'),
        (admin_id, 'Reporte diario del sistema', 'Resumen diario: 5 solicitudes procesadas, 23 mensajes enviados, 89% de satisfacción', 'system', 'low', false, now() - interval '6 hours');

        -- Insertar sesiones de calculadora
        INSERT INTO calculator_sessions (user_id, name, type, parameters, results, is_favorite, created_at) VALUES
        (client_id, 'Barrenado Acero Inoxidable 316L', 'barrenado', 
         '{"D": 12, "Z": 2, "N": 1500, "Vc": 120, "fz": 0.15, "fn": 0.30, "Vf": 450, "Pb": 25, "Nb": 8}',
         '{"Tc": 4.44, "Q": 11.25}', true, now() - interval '2 days'),
        (client_id, 'Fresado Aluminio 6061', 'fresado',
         '{"D": 20, "Z": 4, "N": 2000, "Vc": 200, "fz": 0.20, "fn": 0.80, "Vf": 1600, "ap": 5, "ae": 10, "Np": 3, "Lm": 100}',
         '{"Tc": 11.25, "Q": 80.0}', true, now() - interval '1 day'),
        (client2_id, 'Barrenado Aluminio Estándar', 'barrenado',
         '{"D": 8, "Z": 2, "N": 2500, "Vc": 150, "fz": 0.12, "fn": 0.24, "Vf": 600, "Pb": 15, "Nb": 12}',
         '{"Tc": 3.0, "Q": 7.2}', false, now() - interval '3 days');

        -- Insertar plantillas públicas
        INSERT INTO calculator_templates (name, description, type, parameters, is_public, created_by, created_at) VALUES
        ('Acero Inoxidable 316L - Barrenado', 'Parámetros optimizados para barrenado en acero inoxidable 316L', 'barrenado',
         '{"D": 10, "Z": 2, "Vc": 120, "fz": 0.15, "material": "316L", "coating": "TiAlN"}', true, admin_id, now() - interval '1 week'),
        ('Aluminio 6061 - Fresado', 'Configuración estándar para fresado de aluminio 6061', 'fresado',
         '{"D": 16, "Z": 3, "Vc": 200, "fz": 0.18, "ap": 4, "ae": 8, "material": "6061", "coolant": "flood"}', true, admin_id, now() - interval '1 week'),
        ('Acero al Carbón - Barrenado', 'Parámetros para barrenado general en acero al carbón', 'barrenado',
         '{"D": 12, "Z": 2, "Vc": 100, "fz": 0.12, "material": "carbon_steel", "coating": "TiN"}', true, admin_id, now() - interval '1 week');

        -- Insertar logs de actividad
        INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at) VALUES
        (client_id, 'login', 'user', client_id, '{"ip": "192.168.1.100", "device": "mobile"}', now() - interval '5 minutes'),
        (client_id, 'create_request', 'request', (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1), '{"priority": "urgente", "type": "technical_support"}', now() - interval '2 hours'),
        (agent_id, 'update_request_status', 'request', (SELECT id FROM requests WHERE titulo LIKE 'Soporte técnico urgente%' LIMIT 1), '{"old_status": "asignado", "new_status": "en_proceso"}', now() - interval '30 minutes'),
        (agent_id, 'send_message', 'message', NULL, '{"chat_type": "support", "message_type": "text"}', now() - interval '10 minutes'),
        (client_id, 'use_calculator', 'calculator', NULL, '{"type": "barrenado", "material": "stainless_steel"}', now() - interval '1 day'),
        (admin_id, 'view_dashboard', 'system', NULL, '{"section": "analytics", "duration": 300}', now() - interval '6 hours'),
        (client2_id, 'search_directory', 'directory', NULL, '{"query": "soporte", "results": 3}', now() - interval '1 hour');

        -- Insertar métricas del sistema
        INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags, recorded_at) VALUES
        ('active_users_daily', 89, 'counter', '{"period": "24h"}', now()),
        ('requests_created_daily', 12, 'counter', '{"period": "24h"}', now()),
        ('messages_sent_daily', 45, 'counter', '{"period": "24h"}', now()),
        ('avg_response_time_hours', 2.4, 'gauge', '{"unit": "hours"}', now()),
        ('satisfaction_rate', 4.6, 'gauge', '{"scale": "1-5"}', now()),
        ('system_uptime_percentage', 99.8, 'gauge', '{"unit": "percentage"}', now());

        RAISE NOTICE 'Datos demo insertados exitosamente usando usuarios existentes';
    ELSE
        RAISE NOTICE 'No se encontraron todos los usuarios requeridos. Usuarios encontrados: admin=%, agent=%, client=%', 
                     CASE WHEN admin_id IS NOT NULL THEN 'OK' ELSE 'MISSING' END,
                     CASE WHEN agent_id IS NOT NULL THEN 'OK' ELSE 'MISSING' END,
                     CASE WHEN client_id IS NOT NULL THEN 'OK' ELSE 'MISSING' END;
    END IF;
END $$;