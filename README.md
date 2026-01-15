# 🧩 DOM TEA - Sistema de Acompanhamento Terapêutico ABA

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green)

Sistema completo e profissional para acompanhamento de terapia **ABA (Applied Behavior Analysis)** para crianças com autismo. Inclui insights de IA, gráficos detalhados e relatórios para terapeutas e pais.

---

## 🚀 Funcionalidades

- 📊 **Dashboard** com estatísticas em tempo real
- 📚 **Programas de Ensino** (Mand, Tact, Receptivo, Motor, Social, Intraverbal)
- ⏱️ **Sessões de Terapia** com cronômetro e registro de tentativas
- 🎯 **Níveis de Prompt** (Independente, Verbal, Gestual, Física Parcial, Física Total)
- 📈 **Relatórios e Gráficos** de evolução
- 🧠 **Insights IA** com análises e recomendações
- 🏆 **Gamificação** com conquistas e streaks
- 📱 **PWA** - Funciona offline no celular
- 🌙 **Tema Escuro/Claro** (Autism Blue)

---

## 📋 Requisitos

- **Node.js** 18 ou superior
- **PostgreSQL** 14 ou superior
- **npm** ou **yarn**

---

## 🛠️ Instalação Local

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/dom-tea.git
cd dom-tea
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas credenciais
nano .env
```

Conteúdo do `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/domtea"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configurar o banco de dados

```bash
# Criar as tabelas no PostgreSQL
npx prisma migrate dev --name init

# Gerar o cliente Prisma
npx prisma generate
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🖥️ Deploy em VPS Ubuntu 22.04

### Passo 1: Preparar o servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node -v  # Deve mostrar v20.x.x
npm -v
```

### Passo 2: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Acessar o PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE domtea;
CREATE USER domtea_user WITH ENCRYPTED PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE domtea TO domtea_user;
\c domtea
GRANT ALL ON SCHEMA public TO domtea_user;
\q
```

### Passo 3: Clonar e configurar o projeto

```bash
# Criar pasta para aplicações
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www

# Clonar o projeto
git clone https://github.com/seu-usuario/dom-tea.git
cd dom-tea

# Instalar dependências
npm install

# Copiar e configurar .env
cp .env.example .env
nano .env
```

Configure o `.env`:
```env
DATABASE_URL="postgresql://domtea_user:sua_senha_forte@localhost:5432/domtea"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="https://seudominio.com"
NODE_ENV="production"
```

### Passo 4: Executar migrações e build

```bash
# Criar tabelas no banco
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Build de produção
npm run build
```

### Passo 5: Configurar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "domtea" -- start

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Ver logs
pm2 logs domtea
```

### Passo 6: Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/domtea
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

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
    }
}
```

Ativar configuração:
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/domtea /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 7: Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática (já configurada por padrão)
sudo certbot renew --dry-run
```

---

## 📁 Estrutura do Projeto

```
dom-tea/
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── public/
│   ├── icons/             # Ícones PWA
│   └── manifest.json      # Manifesto PWA
├── src/
│   ├── app/
│   │   ├── api/           # Rotas de API
│   │   │   ├── patients/
│   │   │   ├── programs/
│   │   │   ├── sessions/
│   │   │   ├── trials/
│   │   │   ├── behaviors/
│   │   │   ├── checkins/
│   │   │   ├── settings/
│   │   │   └── stats/
│   │   ├── achievements/
│   │   ├── behaviors/
│   │   ├── insights/
│   │   ├── programs/
│   │   ├── reports/
│   │   ├── session/
│   │   ├── settings/
│   │   └── ...
│   ├── components/        # Componentes React
│   └── lib/
│       ├── dataService.js # Camada de dados
│       └── prisma.js      # Cliente Prisma
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

---

## 🗄️ Esquema do Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `Patient` | Dados da criança |
| `Program` | Programas de ensino ABA |
| `Target` | Alvos/metas de cada programa |
| `Session` | Sessões de terapia |
| `Trial` | Tentativas individuais |
| `Behavior` | Comportamentos-alvo |
| `BehaviorRecord` | Registros de comportamento |
| `DailyCheckin` | Check-in diário (sono, humor, saúde) |
| `Reinforcer` | Reforçadores disponíveis |
| `Settings` | Configurações do usuário |
| `Achievement` | Conquistas desbloqueadas |

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar produção
npm start

# Visualizar banco com Prisma Studio
npx prisma studio

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Reset do banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset
```

---

## 📱 PWA (Progressive Web App)

O sistema funciona como um aplicativo instalável:

1. Acesse o site pelo Chrome no celular
2. Toque nos 3 pontos (⋮) > "Adicionar à tela inicial"
3. O app será instalado como um aplicativo nativo

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com 💙 para ajudar no acompanhamento de crianças com autismo.

---

## ⭐ Apoie o Projeto

Se este projeto te ajudou, deixe uma ⭐ no repositório!
