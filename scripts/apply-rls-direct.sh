#!/bin/bash

# ============================================================================
# Script para aplicar RLS policies a tabla requests
# Usa psql directamente con connection string de Supabase
# ============================================================================

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "======================================================================"
echo "   APLICAR MIGRACIÓN RLS - TABLA REQUESTS"
echo "======================================================================"
echo ""

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo -e "${RED}✗ Error: No se encontró archivo .env${NC}"
    exit 1
fi

# Cargar variables de entorno
source .env

# Verificar variables requeridas
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}✗ Error: EXPO_PUBLIC_SUPABASE_URL no está definida${NC}"
    exit 1
fi

echo -e "${BLUE}ℹ${NC} Supabase URL: $EXPO_PUBLIC_SUPABASE_URL"

# Extraer project ref de la URL
PROJECT_REF=$(echo $EXPO_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
echo -e "${BLUE}ℹ${NC} Project Ref: $PROJECT_REF"

echo ""
echo -e "${YELLOW}⚠${NC}  IMPORTANTE:"
echo "   Para aplicar RLS policies necesitas:"
echo "   1. Acceso al Supabase Dashboard"
echo "   2. O el Database Password"
echo ""
echo "   Opciones:"
echo "   A) Aplicar manualmente desde Supabase Dashboard (RECOMENDADO)"
echo "   B) Aplicar con psql (requiere password)"
echo ""

read -p "¿Qué opción prefieres? (A/B): " option

case $option in
    [Aa])
        echo ""
        echo "======================================================================"
        echo "   APLICAR MANUALMENTE DESDE SUPABASE DASHBOARD"
        echo "======================================================================"
        echo ""
        echo -e "${CYAN}▶${NC} Pasos a seguir:"
        echo ""
        echo "   1. Abrir Supabase Dashboard:"
        echo -e "      ${BLUE}https://supabase.com/dashboard/project/${PROJECT_REF}/editor${NC}"
        echo ""
        echo "   2. Ir a SQL Editor:"
        echo "      - Click en 'SQL Editor' en el menú lateral"
        echo "      - Click en '+ New query'"
        echo ""
        echo "   3. Copiar el contenido del archivo:"
        echo -e "      ${YELLOW}supabase/migrations/20250114_add_rls_policies_requests.sql${NC}"
        echo ""
        echo "   4. Pegar en el editor y ejecutar (Run)"
        echo ""
        echo "   5. Verificar resultado:"
        echo "      - Debe mostrar 'Success. No rows returned'"
        echo "      - O mensajes de policies creadas"
        echo ""
        echo -e "${GREEN}✓${NC} Una vez aplicado, continuar con testing"
        echo ""

        # Copiar contenido al portapapeles si está disponible
        if command -v xclip &> /dev/null; then
            cat supabase/migrations/20250114_add_rls_policies_requests.sql | xclip -selection clipboard
            echo -e "${GREEN}✓${NC} Contenido copiado al portapapeles"
        fi
        ;;

    [Bb])
        echo ""
        echo "======================================================================"
        echo "   APLICAR CON PSQL"
        echo "======================================================================"
        echo ""
        echo -e "${YELLOW}⚠${NC}  Necesitas el Database Password de Supabase"
        echo ""
        read -p "¿Tienes el Database Password? (y/n): " has_password

        if [[ $has_password == [Yy] ]]; then
            # Construir connection string
            DB_HOST="db.${PROJECT_REF}.supabase.co"
            DB_PORT="5432"
            DB_NAME="postgres"
            DB_USER="postgres"

            echo ""
            echo -e "${BLUE}ℹ${NC} Connection String:"
            echo "   Host: $DB_HOST"
            echo "   Port: $DB_PORT"
            echo "   Database: $DB_NAME"
            echo "   User: $DB_USER"
            echo ""

            read -sp "Ingresa Database Password: " DB_PASSWORD
            echo ""

            # Verificar que psql está instalado
            if ! command -v psql &> /dev/null; then
                echo -e "${RED}✗ Error: psql no está instalado${NC}"
                echo "   Instalar con: sudo apt-get install postgresql-client"
                exit 1
            fi

            echo ""
            echo -e "${CYAN}▶${NC} Aplicando migración..."

            # Aplicar migración
            PGPASSWORD="$DB_PASSWORD" psql \
                -h "$DB_HOST" \
                -p "$DB_PORT" \
                -U "$DB_USER" \
                -d "$DB_NAME" \
                -f supabase/migrations/20250114_add_rls_policies_requests.sql

            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}✓ Migración aplicada exitosamente${NC}"
            else
                echo ""
                echo -e "${RED}✗ Error al aplicar migración${NC}"
                exit 1
            fi
        else
            echo ""
            echo -e "${BLUE}ℹ${NC} Para obtener el Database Password:"
            echo "   1. Ir a: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
            echo "   2. Copiar 'Database Password'"
            echo "   3. Volver a ejecutar este script"
            echo ""
        fi
        ;;

    *)
        echo ""
        echo -e "${RED}✗ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================================================"
echo "   PRÓXIMOS PASOS"
echo "======================================================================"
echo ""
echo -e "${CYAN}▶${NC} 1. Verificar policies en Dashboard:"
echo "      https://supabase.com/dashboard/project/${PROJECT_REF}/auth/policies"
echo ""
echo -e "${CYAN}▶${NC} 2. Ejecutar testing:"
echo "      npm run test:rls"
echo ""
echo -e "${CYAN}▶${NC} 3. Probar desde la app con diferentes roles"
echo ""
echo "======================================================================"
echo ""
