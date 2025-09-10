#!/usr/bin/env node

/**
 * Script para validar usuarios existentes en Supabase
 * Verifica que los usuarios necesarios estén en auth.users y users table
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

const expectedUsers = [
  { email: 'i.pineda@elmec.com.mx', role: 'admin', name: 'Ivan Pineda' },
  { email: 'j.gonzalez@elmec.com.mx', role: 'agent', name: 'Javier González' },
  { email: 'cliente@gmail.com', role: 'customer', name: 'María López' },
  { email: 'rgarciavital@gmail.com', role: 'customer', name: 'Roberto García' },
];

async function validateExistingUsers() {
  console.log('🔍 Validando usuarios existentes en Supabase...\n');

  try {
    // 1. Verificar usuarios en la tabla users
    console.log('👥 Verificando tabla users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, nombre, apellido_paterno, rol, activo, is_online')
      .order('email');

    if (usersError) {
      console.error('❌ Error al obtener usuarios:', usersError.message);
      return false;
    }

    console.log(`✅ Usuarios encontrados en tabla users: ${users.length}`);

    // Verificar cada usuario esperado
    const foundUsers = [];
    const missingUsers = [];

    expectedUsers.forEach(expectedUser => {
      const found = users.find(user => user.email === expectedUser.email);
      if (found) {
        foundUsers.push({
          ...expectedUser,
          id: found.id,
          actualRole: found.rol,
          active: found.activo,
          online: found.is_online,
        });
        console.log(
          `   ✅ ${expectedUser.email} - ${found.nombre} ${found.apellido_paterno} (${found.rol})`
        );
      } else {
        missingUsers.push(expectedUser);
        console.log(`   ❌ ${expectedUser.email} - NO ENCONTRADO`);
      }
    });

    // 2. Verificar que los usuarios tengan los roles correctos
    console.log('\n🔐 Verificando roles...');
    let roleErrors = 0;
    foundUsers.forEach(user => {
      if (user.actualRole !== user.role) {
        console.log(
          `   ⚠️  ${user.email}: rol esperado '${user.role}', actual '${user.actualRole}'`
        );
        roleErrors++;
      } else {
        console.log(`   ✅ ${user.email}: rol '${user.actualRole}' correcto`);
      }
    });

    // 3. Mostrar resumen
    console.log('\n📊 RESUMEN DE VALIDACIÓN');
    console.log('═══════════════════════════════════════');
    console.log(
      `👥 Usuarios encontrados: ${foundUsers.length}/${expectedUsers.length}`
    );
    console.log(
      `🔐 Roles correctos: ${foundUsers.length - roleErrors}/${foundUsers.length}`
    );
    console.log(`❌ Usuarios faltantes: ${missingUsers.length}`);

    if (missingUsers.length > 0) {
      console.log('\n⚠️  USUARIOS FALTANTES:');
      missingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      console.log(
        '\n💡 SOLUCIÓN: Crea estos usuarios manualmente en Supabase Auth o usa el registro de la app'
      );
    }

    if (roleErrors > 0) {
      console.log('\n⚠️  ROLES INCORRECTOS DETECTADOS');
      console.log(
        '💡 SOLUCIÓN: Ejecuta la migración de datos demo para corregir los roles'
      );
    }

    // 4. Verificar estructura de tablas
    console.log('\n🗄️  Verificando estructura de tablas...');
    const tables = [
      'users',
      'requests',
      'chat_rooms',
      'messages',
      'notifications',
      'calculator_sessions',
    ];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        console.log(`   ❌ Tabla '${table}': ${error.message}`);
      } else {
        console.log(`   ✅ Tabla '${table}': accesible`);
      }
    }

    // 5. Recomendaciones
    console.log('\n🎯 RECOMENDACIONES:');

    if (foundUsers.length >= 3) {
      console.log('✅ Tienes suficientes usuarios para probar la aplicación');
      console.log('🚀 Puedes ejecutar la migración de datos demo ahora');
    } else {
      console.log('⚠️  Necesitas crear más usuarios para una demo completa');
      console.log('📝 Crea los usuarios faltantes en Supabase Auth primero');
    }

    if (roleErrors === 0 && missingUsers.length === 0) {
      console.log('🎉 ¡Todo está listo para insertar datos demo!');
      return true;
    }

    return foundUsers.length >= 2; // Mínimo 2 usuarios para funcionalidad básica
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
    return false;
  }
}

// Ejecutar validación
validateExistingUsers()
  .then(success => {
    if (success) {
      console.log('\n✅ Validación completada - Listo para datos demo');
      process.exit(0);
    } else {
      console.log('\n❌ Se requieren correcciones antes de continuar');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
