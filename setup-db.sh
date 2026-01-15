#!/bin/bash
# ===== SCRIPT DE SETUP DO BANCO DE DADOS DOM TEA =====
# Execute: bash setup-db.sh

set -e

echo "🗄️ Configurando banco de dados DOM TEA..."
echo ""

# 1. Configurar .env
echo "⚙️ [1/5] Configurando variáveis de ambiente..."
cat > /var/www/dom_tea/.env << 'EOF'
DATABASE_URL="postgresql://domtea_user:DomTea@2026Secure@localhost:5432/domtea"
NEXTAUTH_SECRET="domtea-secret-key-2026-secure-random"
NEXTAUTH_URL="http://72.62.14.196"
NODE_ENV="production"
EOF
echo "   ✓ .env configurado"

# 2. Corrigir senha do usuário PostgreSQL
echo "🔐 [2/5] Configurando usuário PostgreSQL..."
sudo -u postgres psql -c "ALTER USER domtea_user WITH PASSWORD 'DomTea@2026Secure';" 2>/dev/null || echo "   Usuário já configurado"
echo "   ✓ Senha configurada"

# 3. Dar permissões completas ao usuário
echo "🔑 [3/5] Configurando permissões..."
sudo -u postgres psql -d domtea -c "GRANT ALL ON SCHEMA public TO domtea_user;" 2>/dev/null || true
sudo -u postgres psql -d domtea -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domtea_user;" 2>/dev/null || true
sudo -u postgres psql -d domtea -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domtea_user;" 2>/dev/null || true
echo "   ✓ Permissões configuradas"

# 4. Criar tabelas com Prisma
echo "📊 [4/5] Criando tabelas no banco de dados..."
cd /var/www/dom_tea
npx prisma generate
npx prisma db push --accept-data-loss
echo "   ✓ Tabelas criadas"

# 5. Rebuild e restart
echo "🔨 [5/5] Rebuild e restart da aplicação..."
npm run build
pm2 restart domtea 2>/dev/null || pm2 start npm --name "domtea" -- start

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Verificando tabelas criadas:"
sudo -u postgres psql -d domtea -c "\dt"
echo ""
echo "🌍 Acesse: http://72.62.14.196"
echo ""
