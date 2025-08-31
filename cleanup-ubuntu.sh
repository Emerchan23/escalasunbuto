#!/bin/bash

# Script de Limpeza Completa - Sistema de Escalas Ubuntu
# Execute este script para remover completamente a instalação anterior

echo "🧹 Iniciando limpeza completa da instalação anterior..."

# 1. Parar todos os containers relacionados
echo "📦 Parando containers Docker..."
docker stop $(docker ps -q --filter "name=escalas") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=postgres") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=redis") 2>/dev/null || true

# 2. Remover containers
echo "🗑️ Removendo containers..."
docker rm $(docker ps -aq --filter "name=escalas") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=postgres") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=redis") 2>/dev/null || true

# 3. Remover imagens relacionadas
echo "🖼️ Removendo imagens Docker..."
docker rmi $(docker images -q --filter "reference=*escalas*") 2>/dev/null || true

# 4. Remover volumes
echo "💾 Removendo volumes Docker..."
docker volume rm $(docker volume ls -q --filter "name=escalas") 2>/dev/null || true
docker volume rm $(docker volume ls -q --filter "name=postgres") 2>/dev/null || true

# 5. Limpar cache do Docker
echo "🧽 Limpando cache do Docker..."
docker system prune -f

# 6. Remover diretórios antigos
echo "📁 Removendo diretórios antigos..."
cd $HOME
rm -rf escalasunbuto/ 2>/dev/null || true
rm -rf sistema-escalas/ 2>/dev/null || true
rm -rf projeto-ai/ 2>/dev/null || true

# 7. Limpar logs
echo "📋 Limpando logs..."
sudo journalctl --vacuum-time=1d 2>/dev/null || true

# 8. Verificar se Docker está funcionando
echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "📥 Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Faça logout e login novamente."
else
    echo "✅ Docker está instalado"
fi

# 9. Verificar Node.js e npm
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "📥 Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js está instalado: $(node --version)"
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado!"
    sudo apt-get install -y npm
else
    echo "✅ npm está instalado: $(npm --version)"
fi

# 10. Verificar Git
echo "🔍 Verificando Git..."
if ! command -v git &> /dev/null; then
    echo "❌ Git não está instalado!"
    echo "📥 Instalando Git..."
    sudo apt-get update
    sudo apt-get install -y git
else
    echo "✅ Git está instalado: $(git --version)"
fi

echo ""
echo "🎉 Limpeza completa finalizada!"
echo ""
echo "📋 Próximos passos:"
echo "1. Se o Docker foi instalado agora, faça logout e login novamente"
echo "2. Execute a nova instalação:"
echo "   git clone https://github.com/Emerchan23/escalasunbuto.git"
echo "   cd escalasunbuto"
echo "   chmod +x install-ubuntu.sh"
echo "   ./install-ubuntu.sh"
echo ""
echo "✨ Sistema pronto para nova instalação limpa!"