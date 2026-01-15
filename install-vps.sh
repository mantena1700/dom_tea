#!/bin/bash
# ===== SCRIPT DE INSTALAÇÃO DOM TEA =====
# Execute na VPS Ubuntu 22.04 como root

set -e  # Parar em caso de erro

echo "🚀 Iniciando instalação do DOM TEA..."
echo ""

# 1. Atualizar sistema
echo "🔄 [1/13] Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 20
echo "📦 [2/13] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "   Node: $(node -v)"
echo "   NPM: $(npm -v)"

# 3. Instalar PostgreSQL
echo "🐘 [3/13] Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 4. Configurar banco de dados
echo "🗄️ [4/13] Configurando banco de dados..."
sudo -u postgres psql -c "CREATE DATABASE domtea;" 2>/dev/null || echo "   Banco já existe"
sudo -u postgres psql -c "CREATE USER domtea_user WITH ENCRYPTED PASSWORD 'DomTea@2026Secure';" 2>/dev/null || echo "   Usuário já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE domtea TO domtea_user;"
sudo -u postgres psql -d domtea -c "GRANT ALL ON SCHEMA public TO domtea_user;"

# 5. Instalar Nginx
echo "🌐 [5/13] Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 6. Instalar PM2
echo "⚡ [6/13] Instalando PM2..."
npm install -g pm2

# 7. Criar pasta e clonar projeto
echo "📁 [7/13] Clonando projeto do GitHub..."
mkdir -p /var/www
cd /var/www
if [ -d "dom_tea" ]; then
    echo "   Pasta já existe, atualizando..."
    cd dom_tea
    git pull
else
    git clone https://github.com/mantena1700/dom_tea.git
    cd dom_tea
fi

# 8. Instalar dependências
echo "📦 [8/13] Instalando dependências Node..."
npm install

# 9. Criar arquivo .env
echo "⚙️ [9/13] Configurando variáveis de ambiente..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://domtea_user:DomTea@2026Secure@localhost:5432/domtea"
NEXTAUTH_SECRET="domtea-secret-key-2026-secure-random-string-xyz123"
NEXTAUTH_URL="http://72.62.14.196"
NODE_ENV="production"
EOF

# 10. Rodar migrações Prisma
echo "🗃️ [10/13] Executando migrações do banco..."
npx prisma generate
npx prisma migrate deploy || npx prisma db push

# 11. Build da aplicação
echo "🔨 [11/13] Fazendo build de produção..."
npm run build

# 12. Iniciar com PM2
echo "🚀 [12/13] Iniciando aplicação com PM2..."
pm2 delete domtea 2>/dev/null || true
pm2 start npm --name "domtea" -- start
pm2 save
pm2 startup systemd -u root --hp /root

# 13. Configurar Nginx
echo "🌐 [13/13] Configurando Nginx..."
cat > /etc/nginx/sites-available/domtea << 'EOF'
server {
    listen 80;
    server_name 72.62.14.196 _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/domtea /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Liberar firewall se estiver ativo
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌍 Acesse o sistema: http://72.62.14.196"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 logs domtea      - Ver logs em tempo real"
echo "   pm2 restart domtea   - Reiniciar aplicação"
echo "   pm2 status           - Ver status do serviço"
echo "   pm2 monit            - Monitor interativo"
echo ""
echo "🗄️ Banco de dados:"
echo "   Host: localhost"
echo "   Database: domtea"
echo "   User: domtea_user"
echo "   Password: DomTea@2026Secure"
echo ""
echo "📁 Arquivos:"
echo "   Aplicação: /var/www/dom_tea"
echo "   Nginx: /etc/nginx/sites-available/domtea"
echo "   Logs: pm2 logs domtea"
echo ""
echo "⚠️ LEMBRE-SE: Altere a senha SSH por segurança!"
echo "   passwd root"
echo ""
