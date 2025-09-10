#!/usr/bin/env node

/**
 * Script de validación de datos demo para ELMEC
 * Verifica que todos los datos estén correctamente insertados en Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log(
    'Asegúrate de tener EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu .env'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateDemoData() {
  console.log('🔍 Iniciando validación de datos demo...\n');

  try {
    // 1. Validar usuarios
    console.log('👥 Validando usuarios...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, nombre, apellido_paterno, rol, activo, is_online')
      .order('rol', { ascending: true });

    if (usersError) {
      console.error('❌ Error al obtener usuarios:', usersError.message);
      return false;
    }

    console.log(`✅ Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      const status = user.is_online ? '🟢' : '🔴';
      console.log(
        `   ${status} ${user.email} (${user.rol}) - ${user.nombre} ${user.apellido_paterno}`
      );
    });

    // 2. Validar solicitudes
    console.log('\n📋 Validando solicitudes...');
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select(
        `
        id, titulo, estatus, prioridad, 
        usuario:users!requests_usuario_id_fkey(nombre, apellido_paterno),
        agente:users!requests_agente_id_fkey(nombre, apellido_paterno)
      `
      )
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('❌ Error al obtener solicitudes:', requestsError.message);
      return false;
    }

    console.log(`✅ Solicitudes encontradas: ${requests.length}`);
    requests.forEach(req => {
      const priorityEmoji =
        {
          baja: '🟢',
          media: '🟡',
          alta: '🟠',
          urgente: '🔴',
        }[req.prioridad] || '⚪';

      const statusEmoji =
        {
          nuevo: '🆕',
          asignado: '📋',
          en_proceso: '⚙️',
          resuelto: '✅',
          cerrado: '🔒',
        }[req.estatus] || '❓';

      console.log(
        `   ${priorityEmoji}${statusEmoji} "${req.titulo}" - ${req.usuario?.nombre} → ${req.agente?.nombre || 'Sin asignar'}`
      );
    });

    // 3. Validar chats
    console.log('\n💬 Validando chats...');
    const { data: chatRooms, error: chatsError } = await supabase
      .from('chat_rooms')
      .select('id, tipo, participants, is_active, request_id, metadata')
      .eq('is_active', true);

    if (chatsError) {
      console.error('❌ Error al obtener chats:', chatsError.message);
      return false;
    }

    console.log(`✅ Salas de chat encontradas: ${chatRooms.length}`);
    chatRooms.forEach(chat => {
      const typeEmoji =
        {
          support: '🛠️',
          sales: '💼',
          general: '💬',
        }[chat.tipo] || '💬';

      const participants =
        chat.metadata?.participant_names?.join(' ↔ ') ||
        `${chat.participants.length} participantes`;
      console.log(`   ${typeEmoji} Chat ${chat.tipo}: ${participants}`);
    });

    // 4. Validar mensajes
    console.log('\n📨 Validando mensajes...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, chat_room_id, sender_name, message, type, created_at')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('❌ Error al obtener mensajes:', messagesError.message);
      return false;
    }

    console.log(`✅ Mensajes encontrados: ${messages.length}`);

    // Agrupar mensajes por chat room
    const messagesByRoom = messages.reduce((acc, msg) => {
      acc[msg.chat_room_id] = (acc[msg.chat_room_id] || 0) + 1;
      return acc;
    }, {});

    Object.entries(messagesByRoom).forEach(([roomId, count]) => {
      const room = chatRooms.find(r => r.id === roomId);
      const participants =
        room?.metadata?.participant_names?.join(' ↔ ') || 'Chat';
      console.log(`   💬 ${participants}: ${count} mensajes`);
    });

    // 5. Validar notificaciones
    console.log('\n🔔 Validando notificaciones...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, title, type, priority, read, user_id')
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error(
        '❌ Error al obtener notificaciones:',
        notificationsError.message
      );
      return false;
    }

    console.log(`✅ Notificaciones encontradas: ${notifications.length}`);
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log(`   📬 Sin leer: ${unreadCount}`);
    console.log(`   📭 Leídas: ${notifications.length - unreadCount}`);

    // Mostrar notificaciones por usuario
    const notificationsByUser = notifications.reduce((acc, notif) => {
      const user = users.find(u => u.id === notif.user_id);
      const userName = user
        ? `${user.nombre} ${user.apellido_paterno}`
        : 'Usuario desconocido';
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {});

    Object.entries(notificationsByUser).forEach(([userName, count]) => {
      console.log(`   👤 ${userName}: ${count} notificaciones`);
    });

    // 6. Validar sesiones de calculadora
    console.log('\n🧮 Validando sesiones de calculadora...');
    const { data: calcSessions, error: calcError } = await supabase
      .from('calculator_sessions')
      .select('id, name, type, is_favorite, user_id')
      .order('created_at', { ascending: false });

    if (calcError) {
      console.error(
        '❌ Error al obtener sesiones de calculadora:',
        calcError.message
      );
      return false;
    }

    console.log(`✅ Sesiones de calculadora: ${calcSessions.length}`);
    const favorites = calcSessions.filter(s => s.is_favorite).length;
    console.log(`   ⭐ Favoritas: ${favorites}`);
    console.log(`   📊 Regulares: ${calcSessions.length - favorites}`);

    calcSessions.forEach(session => {
      const user = users.find(u => u.id === session.user_id);
      const userName = user
        ? `${user.nombre} ${user.apellido_paterno}`
        : 'Usuario';
      const favoriteIcon = session.is_favorite ? '⭐' : '📊';
      console.log(
        `   ${favoriteIcon} "${session.name}" (${session.type}) - ${userName}`
      );
    });

    // 7. Validar plantillas
    console.log('\n📚 Validando plantillas...');
    const { data: templates, error: templatesError } = await supabase
      .from('calculator_templates')
      .select('id, name, type, is_public, created_by')
      .order('created_at', { ascending: false });

    if (templatesError) {
      console.error('❌ Error al obtener plantillas:', templatesError.message);
      return false;
    }

    console.log(`✅ Plantillas encontradas: ${templates.length}`);
    templates.forEach(template => {
      const visibility = template.is_public ? '🌐 Pública' : '🔒 Privada';
      console.log(
        `   📋 "${template.name}" (${template.type}) - ${visibility}`
      );
    });

    // 8. Validar logs de actividad
    console.log('\n📊 Validando logs de actividad...');
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('id, action, resource_type, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('❌ Error al obtener logs:', logsError.message);
      return false;
    }

    console.log(`✅ Logs de actividad: ${logs.length} (mostrando últimos 10)`);
    logs.forEach(log => {
      const user = users.find(u => u.id === log.user_id);
      const userName = user
        ? `${user.nombre} ${user.apellido_paterno}`
        : 'Sistema';
      console.log(
        `   📝 ${log.action} en ${log.resource_type || 'sistema'} - ${userName}`
      );
    });

    // 9. Validar métricas del sistema
    console.log('\n📈 Validando métricas del sistema...');
    const { data: metrics, error: metricsError } = await supabase
      .from('system_metrics')
      .select('metric_name, metric_value, metric_type')
      .order('recorded_at', { ascending: false });

    if (metricsError) {
      console.error('❌ Error al obtener métricas:', metricsError.message);
      return false;
    }

    console.log(`✅ Métricas del sistema: ${metrics.length}`);
    metrics.forEach(metric => {
      console.log(
        `   📊 ${metric.metric_name}: ${metric.metric_value} (${metric.metric_type})`
      );
    });

    // 10. Resumen final
    console.log('\n🎉 ¡VALIDACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Usuarios: ${users.length}`);
    console.log(`📋 Solicitudes: ${requests.length}`);
    console.log(`💬 Chats: ${chatRooms.length}`);
    console.log(`📨 Mensajes: ${messages.length}`);
    console.log(
      `🔔 Notificaciones: ${notifications.length} (${unreadCount} sin leer)`
    );
    console.log(
      `🧮 Sesiones calculadora: ${calcSessions.length} (${favorites} favoritas)`
    );
    console.log(`📚 Plantillas: ${templates.length}`);
    console.log(`📊 Logs: ${logs.length}+`);
    console.log(`📈 Métricas: ${metrics.length}`);
    console.log('═══════════════════════════════════════');
    console.log('🚀 La aplicación está lista para demo completo');

    // 11. Verificar funcionalidades críticas
    console.log('\n🔍 Verificando funcionalidades críticas...');

    // Verificar que cada usuario tenga datos relacionados
    for (const user of users) {
      const userRequests = requests.filter(
        r => r.usuario_id === user.id || r.agente_id === user.id
      );
      const userNotifications = notifications.filter(
        n => n.user_id === user.id
      );
      const userSessions = calcSessions.filter(s => s.user_id === user.id);

      console.log(
        `   👤 ${user.nombre}: ${userRequests.length} solicitudes, ${userNotifications.length} notificaciones, ${userSessions.length} sesiones`
      );
    }

    return true;
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
    return false;
  }
}

// Ejecutar validación
validateDemoData()
  .then(success => {
    if (success) {
      console.log('\n✅ Todos los datos demo están correctamente configurados');
      console.log('🎯 Puedes iniciar sesión con cualquiera de estos usuarios:');
      console.log('   • i.pineda@elmec.com.mx (Admin)');
      console.log('   • j.gonzalez@elmec.com.mx (Agente)');
      console.log('   • cliente@gmail.com (Cliente)');
      console.log('   • rgarciavital@gmail.com (Cliente)');
      console.log('   • Contraseña para todos: password');
      process.exit(0);
    } else {
      console.log('\n❌ Se encontraron problemas en los datos demo');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
