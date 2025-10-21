#!/bin/bash

# Script para configurar variables de entorno en Netlify
# Asegúrate de estar autenticado con: netlify login

echo "🚀 Configurando variables de entorno en Netlify..."

# Leer variables del .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    exit 1
fi

# Cargar variables
source .env

# Verificar que las variables existen
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ] || [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Faltan variables EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env"
    exit 1
fi

echo "📝 Configurando EXPO_PUBLIC_SUPABASE_URL..."
netlify env:set EXPO_PUBLIC_SUPABASE_URL "$EXPO_PUBLIC_SUPABASE_URL"

echo "📝 Configurando EXPO_PUBLIC_SUPABASE_ANON_KEY..."
netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY "$EXPO_PUBLIC_SUPABASE_ANON_KEY"

echo "📝 Configurando EXPO_PUBLIC_ENVIRONMENT..."
netlify env:set EXPO_PUBLIC_ENVIRONMENT "production"

echo "📝 Configurando EXPO_PUBLIC_BASIC_AUTH..."
netlify env:set EXPO_PUBLIC_BASIC_AUTH "false"

echo "✅ Variables de entorno configuradas exitosamente"
echo ""
echo "📋 Variables configuradas:"
echo "  - EXPO_PUBLIC_SUPABASE_URL"
echo "  - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo "  - EXPO_PUBLIC_ENVIRONMENT"
echo "  - EXPO_PUBLIC_BASIC_AUTH"
echo ""
echo "🔄 Ahora puedes hacer un nuevo deploy con:"
echo "   git push"
echo "   o"
echo "   netlify deploy --prod"
