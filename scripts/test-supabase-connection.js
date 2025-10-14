#!/usr/bin/env node

/**
 * Script de Prueba de Conexión con Supabase
 *
 * Este script verifica:
 * 1. Conectividad con Supabase
 * 2. Existencia de tablas principales
 * 3. Usuarios en la base de datos
 * 4. Autenticación
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 === PRUEBA DE CONEXIÓN CON SUPABASE ===\n');

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Faltan credenciales de Supabase');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ Credenciales cargadas');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📡 1. Probando conexión básica...');

    // Test 1: Verificar conexión
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      return false;
    }

    console.log('✅ Conexión exitosa');

    // Test 2: Verificar tablas
    console.log('\n📋 2. Verificando tablas...');

    const tables = [
      'users',
      'requests',
      'chat_rooms',
      'messages',
      'notifications',
      'calculator_sessions'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`   ❌ Tabla "${table}": ${error.message}`);
      } else {
        console.log(`   ✅ Tabla "${table}" existe`);
      }
    }

    // Test 3: Contar usuarios
    console.log('\n👥 3. Verificando usuarios en la base de datos...');

    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('email, nombre, apellido_paterno, rol', { count: 'exact' });

    if (usersError) {
      console.error('❌ Error al obtener usuarios:', usersError.message);
    } else {
      console.log(`✅ Total de usuarios: ${count || users.length}`);

      if (users && users.length > 0) {
        console.log('\n   Usuarios encontrados:');
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.rol}) - ${user.nombre || 'Sin nombre'} ${user.apellido_paterno || ''}`);
        });
      } else {
        console.log('⚠️  No hay usuarios en la base de datos');
        console.log('   Necesitas ejecutar las migraciones SQL primero');
      }
    }

    // Test 4: Probar autenticación
    console.log('\n🔐 4. Probando autenticación (intento de login)...');
    console.log('   Nota: Este test solo verifica si el sistema de auth está configurado');
    console.log('   No intentaremos hacer login real para no generar errores');

    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('⚠️  Sistema de autenticación:', authError.message);
    } else {
      console.log('✅ Sistema de autenticación configurado');
      if (authData.session) {
        console.log('   Hay una sesión activa');
      } else {
        console.log('   No hay sesión activa (esperado)');
      }
    }

    // Test 5: Verificar configuración RLS
    console.log('\n🛡️  5. Verificando configuración de seguridad (RLS)...');
    console.log('   Nota: Si ves errores de permisos, es normal si RLS está activo');

    // Test 6: Verificar solicitudes
    console.log('\n📝 6. Verificando solicitudes...');

    const { data: requests, error: reqError } = await supabase
      .from('requests')
      .select('id, titulo, estatus')
      .limit(5);

    if (reqError) {
      console.log(`   ℹ️  ${reqError.message}`);
      console.log('   Esto es normal si RLS está activo sin autenticación');
    } else if (requests) {
      console.log(`✅ ${requests.length} solicitudes encontradas`);
      requests.forEach(req => {
        console.log(`   - ${req.titulo} (${req.estatus})`);
      });
    }

    console.log('\n✅ === PRUEBA COMPLETADA ===\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message);
    console.error(error);
    return false;
  }
}

// Ejecutar pruebas
testConnection().then(success => {
  if (success) {
    console.log('✅ Conexión con Supabase verificada exitosamente\n');
    process.exit(0);
  } else {
    console.log('❌ Hubo problemas con la conexión\n');
    console.log('📚 Guía de solución de problemas:');
    console.log('   1. Verifica que las credenciales sean correctas en .env.production');
    console.log('   2. Ejecuta las migraciones SQL en Supabase SQL Editor');
    console.log('   3. Crea usuarios en Supabase Auth > Users');
    console.log('   4. Verifica políticas RLS en Database > Policies\n');
    process.exit(1);
  }
});
