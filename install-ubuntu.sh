#!/bin/bash

# Script de Instalação Automática - Sistema de Escalas para Ubuntu
# Autor: Sistema de Escalas
# Versão: 1.0

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Execute como usuário normal."
fi

# Verificar se é Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    error "Este script é específico para Ubuntu. Sistema detectado: $(lsb_release -d | cut -f2)"
fi

log "🚀 Iniciando instalação automática do Sistema de Escalas para Ubuntu"
log "📋 Verificando sistema..."

# Verificar versão do Ubuntu
UBUNTU_VERSION=$(lsb_release -rs)
info "Versão do Ubuntu detectada: $UBUNTU_VERSION"

# Atualizar sistema
log "📦 Atualizando repositórios do sistema..."
sudo apt update

log "⬆️ Atualizando pacotes do sistema..."
sudo apt upgrade -y

# Instalar dependências básicas
log "🔧 Instalando dependências básicas..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Docker
log "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Remover versões antigas
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar chave GPG oficial do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Adicionar repositório do Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Atualizar repositórios
    sudo apt update
    
    # Instalar Docker
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    log "✅ Docker instalado com sucesso!"
else
    info "Docker já está instalado: $(docker --version)"
fi

# Instalar Docker Compose (standalone)
log "🔗 Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose instalado: $(docker-compose --version)"
else
    info "Docker Compose já está instalado: $(docker-compose --version)"
fi

# Instalar Node.js e npm
log "📦 Instalando Node.js e npm..."
if ! command -v node &> /dev/null; then
    # Instalar Node.js 20.x LTS
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    log "✅ Node.js instalado: $(node --version)"
    log "✅ npm instalado: $(npm --version)"
else
    info "Node.js já está instalado: $(node --version)"
    info "npm já está instalado: $(npm --version)"
fi

# Verificar se o Docker está rodando
log "🔍 Verificando serviços..."
if ! sudo systemctl is-active --quiet docker; then
    log "🔄 Iniciando serviço Docker..."
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Verificar instalações
log "✅ Verificando instalações..."
info "Docker: $(docker --version)"
info "Docker Compose: $(docker-compose --version)"
info "Node.js: $(node --version)"
info "npm: $(npm --version)"

# Clonar ou verificar projeto
log "📁 Configurando projeto..."
PROJECT_DIR="$HOME/escalasunbuto"

if [ ! -d "$PROJECT_DIR" ]; then
    warn "Diretório do projeto não encontrado. Você precisa:"
    warn "1. Clonar o repositório: git clone https://github.com/Emerchan23/escalasunbuto.git"
    warn "2. Ou fazer download e extrair para: $PROJECT_DIR"
    warn "3. Executar: cd $PROJECT_DIR && ./install-ubuntu.sh"
    
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    cd "$PROJECT_DIR"
    log "📂 Entrando no diretório: $PROJECT_DIR"
    
    # Verificar estrutura do projeto
    if [ ! -d "projeto-ai" ]; then
        error "❌ Diretório projeto-ai não encontrado! Certifique-se de ter clonado o repositório corretamente: git clone https://github.com/Emerchan23/escalasunbuto.git"
    fi
    
    # Navegar para o diretório do projeto
    cd projeto-ai
    log "📂 Entrando no diretório: $(pwd)"
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        error "❌ Arquivo package.json não encontrado no diretório projeto-ai!"
    fi
    
    # Voltar para o diretório principal
    cd "$PROJECT_DIR"
fi

# Configurar permissões
log "🔐 Configurando permissões..."
if [ -d "$PROJECT_DIR" ]; then
    # Criar diretório data se não existir
    mkdir -p "$PROJECT_DIR/data"
    
    # Definir permissões
    chmod +x "$PROJECT_DIR/install-ubuntu.sh" 2>/dev/null || true
    chmod 755 "$PROJECT_DIR/data" 2>/dev/null || true
fi

# Instalar dependências do projeto (se package.json existir)
if [ -f "$PROJECT_DIR/projeto-ai/package.json" ]; then
    log "📦 Instalando dependências do projeto..."
    cd "$PROJECT_DIR/projeto-ai"
    npm install --legacy-peer-deps
    log "✅ Dependências instaladas com sucesso!"
    
    log "🚀 Configurando sistema..."
    npm run setup:auto
    log "✅ Sistema configurado com sucesso!"
    
    cd "$PROJECT_DIR"
fi

# Executar instalação automática
if [ -f "$PROJECT_DIR/projeto-ai/package.json" ]; then
    log "🚀 Executando instalação automática..."
    cd "$PROJECT_DIR"
    
    # Verificar se o grupo docker foi aplicado
    if ! groups $USER | grep -q docker; then
        warn "⚠️  Você foi adicionado ao grupo 'docker', mas precisa fazer logout/login ou executar:"
        warn "newgrp docker"
        warn "Ou reiniciar o sistema para aplicar as permissões."
        
        read -p "Deseja continuar com sudo? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "🔄 Executando com sudo..."
            cd projeto-ai && sudo npm run setup:auto
        else
            warn "Execute 'newgrp docker' e depois 'npm run setup:auto' no diretório projeto-ai"
        fi
    else
        cd projeto-ai && npm run setup:auto
    fi
else
    warn "Arquivo package.json não encontrado. Certifique-se de que o projeto está completo."
fi

log "🎉 Instalação concluída!"
log "📋 Próximos passos:"
info "1. Se necessário, faça logout/login para aplicar permissões do Docker"
info "2. Navegar para o diretório do projeto: cd $PROJECT_DIR && cd projeto-ai"
info "3. Iniciar o sistema: npm run docker:up"
info "4. Acessar: http://localhost:4000"
info "5. Comandos úteis (executar em $PROJECT_DIR/projeto-ai):"
info "   - npm run setup:auto    # Reinstalar sistema"
info "   - npm run docker:up     # Iniciar containers"
info "   - npm run docker:down   # Parar containers"
info "   - npm run docker:logs   # Ver logs"
info "   - npm run health-check  # Verificar saúde"
info "6. Para desinstalar completamente o sistema:"
info "   - cd $PROJECT_DIR"
info "   - chmod +x cleanup-ubuntu.sh"
info "   - ./cleanup-ubuntu.sh"

log "✅ Sistema de Escalas instalado com sucesso no Ubuntu!"