# 🐧 Instalação Automática no Ubuntu

## Sistema de Escalas - Guia de Instalação para Ubuntu

### 📋 Pré-requisitos

- **Sistema Operacional**: Ubuntu 18.04 LTS ou superior
- **Usuário**: Conta de usuário com privilégios sudo (não root)
- **Conexão**: Internet ativa para download de dependências
- **Espaço**: Mínimo 2GB de espaço livre em disco

### 🚀 Instalação Automática (Recomendada)

#### Opção 1: Script de Instalação Completa

```bash
# 1. Clonar o repositório
git clone https://github.com/Emerchan23/escalasunbuto.git
cd escalasunbuto

# 2. Executar instalação automática
chmod +x install-ubuntu.sh
./install-ubuntu.sh

# 3. Aguardar conclusão da instalação
# O sistema estará disponível em: http://localhost:4000
```

#### Opção 2: Instalação Manual das Dependências

```bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências básicas
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Instalar Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Instalar Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Instalar Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 6. Configurar usuário Docker
sudo usermod -aG docker $USER
newgrp docker

# 7. Instalar sistema
cd projeto-ai
npm install --legacy-peer-deps
npm run setup:auto
```

### 🔧 Dependências Instaladas Automaticamente

| Componente | Versão | Descrição |
|------------|--------|----------|
| **Docker** | Latest | Containerização |
| **Docker Compose** | Latest | Orquestração de containers |
| **Node.js** | 20.x LTS | Runtime JavaScript |
| **npm** | Latest | Gerenciador de pacotes |
| **Git** | Latest | Controle de versão |
| **Curl/Wget** | Latest | Download de arquivos |

### 📁 Estrutura de Instalação

```
$HOME/escalasunbuto/
├── install-ubuntu.sh          # Script de instalação
├── docker-compose-escalas.yml # Configuração Docker
├── Dockerfile-escalas         # Imagem Docker
├── README.md                  # Documentação principal
├── INSTALACAO-UBUNTU.md       # Guia de instalação
├── data/                      # Banco de dados
│   └── schedule.db
└── projeto-ai/                # Código fonte
    ├── package.json
    ├── server-escalas.js
    └── ...
```

### 🐳 Comandos Docker para Ubuntu

```bash
# Verificar instalação
docker --version
docker-compose --version
node --version
npm --version

# Gerenciar containers
docker-compose -f docker-compose-escalas.yml up -d    # Iniciar
docker-compose -f docker-compose-escalas.yml down     # Parar
docker-compose -f docker-compose-escalas.yml logs -f  # Ver logs
docker-compose -f docker-compose-escalas.yml restart  # Reiniciar

# Verificar status
docker ps                                              # Containers rodando
docker images                                          # Imagens disponíveis
```

### 📦 Scripts NPM Disponíveis

```bash
cd projeto-ai

# Instalação e configuração
npm run setup:auto      # Instalação automática completa
npm run init-db         # Inicializar banco de dados

# Gerenciamento Docker
npm run docker:build    # Construir imagem
npm run docker:up       # Iniciar containers
npm run docker:down     # Parar containers
npm run docker:restart  # Reiniciar containers
npm run docker:logs     # Ver logs dos containers

# Desenvolvimento
npm run dev             # Modo desenvolvimento
npm run build           # Build para produção
npm run start           # Iniciar servidor

# Monitoramento
npm run health-check    # Verificar saúde do sistema
```

### 🌐 Acesso ao Sistema

- **URL Principal**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health
- **Banco de Dados**: SQLite em `./data/schedule.db`

### 🔍 Verificação de Saúde

```bash
# Verificar se o sistema está funcionando
curl -f http://localhost:4000/api/health

# Resposta esperada:
# {"status":"healthy","database":"connected"}

# Ou usando npm
npm run health-check
```

### 🛠️ Solução de Problemas

#### Problema: Permissões do Docker
```bash
# Solução 1: Aplicar grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Solução 2: Reiniciar sessão
logout
# Fazer login novamente

# Solução 3: Reiniciar sistema
sudo reboot
```

#### Problema: Porta 4000 em uso
```bash
# Verificar processo usando a porta
sudo lsof -i :4000

# Parar processo se necessário
sudo kill -9 <PID>

# Ou usar porta alternativa
export PORT=4001
npm run setup:auto
```

#### Problema: Docker não inicia
```bash
# Verificar status do serviço
sudo systemctl status docker

# Iniciar serviço
sudo systemctl start docker
sudo systemctl enable docker

# Verificar logs
sudo journalctl -u docker.service
```

#### Problema: Dependências Node.js
```bash
# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 📊 Monitoramento do Sistema

```bash
# Ver uso de recursos
docker stats

# Logs em tempo real
docker-compose -f docker-compose-escalas.yml logs -f

# Verificar saúde dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Espaço em disco usado pelo Docker
docker system df
```

### 🔄 Atualizações

```bash
# Atualizar sistema
cd escalasunbuto
git pull origin main

# Reconstruir containers
cd projeto-ai
npm run docker:down
npm run docker:build
npm run docker:up
```

### 🗑️ Desinstalação

```bash
# Parar e remover containers
cd projeto-ai
npm run docker:down

# Remover imagens
docker rmi escalas-sistema-escalas:latest

# Remover projeto
cd ~
rm -rf escalasunbuto

# Opcional: Remover Docker (se não usar para outros projetos)
sudo apt remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### 📞 Suporte

- **Logs do Sistema**: `docker-compose logs -f`
- **Status dos Containers**: `docker ps -a`
- **Verificação de Saúde**: `curl http://localhost:4000/api/health`
- **Versões**: `docker --version && node --version`

---

### ✅ Checklist de Instalação

- [ ] Ubuntu 18.04+ instalado
- [ ] Usuário com privilégios sudo
- [ ] Internet ativa
- [ ] Script `install-ubuntu.sh` executado
- [ ] Docker funcionando: `docker --version`
- [ ] Docker Compose funcionando: `docker-compose --version`
- [ ] Node.js funcionando: `node --version`
- [ ] Sistema acessível: http://localhost:4000
- [ ] Health check OK: `curl http://localhost:4000/api/health`

**🎉 Instalação concluída com sucesso!**