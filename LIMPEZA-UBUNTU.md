# 🧹 Guia de Limpeza Completa - Ubuntu

## 📋 Situação
Se a instalação anterior do Sistema de Escalas deu erro no Ubuntu, siga este guia para fazer uma limpeza completa antes de tentar novamente.

## 🚀 Limpeza Automática (Recomendado)

### 1. Baixar o script de limpeza
```bash
# Se você ainda tem o diretório escalasunbuto
cd escalasunbuto
chmod +x cleanup-ubuntu.sh
./cleanup-ubuntu.sh
```

### 2. Ou baixar diretamente do GitHub
```bash
wget https://raw.githubusercontent.com/Emerchan23/escalasunbuto/main/cleanup-ubuntu.sh
chmod +x cleanup-ubuntu.sh
./cleanup-ubuntu.sh
```

## 🔧 Limpeza Manual (Se necessário)

### 1. Parar todos os containers
```bash
# Parar containers relacionados ao projeto
docker stop $(docker ps -q --filter "name=escalas") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=postgres") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=redis") 2>/dev/null || true

# Ou parar todos os containers
docker stop $(docker ps -q)
```

### 2. Remover containers
```bash
# Remover containers específicos
docker rm $(docker ps -aq --filter "name=escalas") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=postgres") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=redis") 2>/dev/null || true

# Ou remover todos os containers parados
docker container prune -f
```

### 3. Remover imagens Docker
```bash
# Remover imagens relacionadas
docker rmi $(docker images -q --filter "reference=*escalas*") 2>/dev/null || true

# Limpar imagens não utilizadas
docker image prune -a -f
```

### 4. Remover volumes
```bash
# Remover volumes específicos
docker volume rm $(docker volume ls -q --filter "name=escalas") 2>/dev/null || true
docker volume rm $(docker volume ls -q --filter "name=postgres") 2>/dev/null || true

# Limpar volumes não utilizados
docker volume prune -f
```

### 5. Limpeza completa do Docker
```bash
# Limpar tudo (cuidado: remove tudo não utilizado)
docker system prune -a -f --volumes
```

### 6. Remover diretórios antigos
```bash
cd $HOME
rm -rf escalasunbuto/
rm -rf sistema-escalas/
rm -rf projeto-ai/
```

### 7. Verificar dependências
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Node.js
node --version
npm --version

# Verificar Git
git --version
```

## 🔄 Reinstalar Dependências (Se necessário)

### Docker
```bash
# Remover Docker antigo
sudo apt-get remove docker docker-engine docker.io containerd runc

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Logout e login novamente
```

### Node.js e npm
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Git
```bash
sudo apt-get update
sudo apt-get install -y git
```

## ✅ Nova Instalação Limpa

Após a limpeza completa:

```bash
# 1. Clonar repositório
git clone https://github.com/Emerchan23/escalasunbuto.git
cd escalasunbuto

# 2. Executar instalação
chmod +x install-ubuntu.sh
./install-ubuntu.sh

# 3. Navegar para o projeto
cd projeto-ai

# 4. Iniciar sistema
npm run docker:up

# 5. Acessar sistema
# http://localhost:4000
```

## 🚨 Problemas Comuns

### Erro de permissão Docker
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

### Porta 4000 ocupada
```bash
# Verificar o que está usando a porta
sudo lsof -i :4000

# Matar processo se necessário
sudo kill -9 <PID>
```

### Erro de espaço em disco
```bash
# Verificar espaço
df -h

# Limpar logs do sistema
sudo journalctl --vacuum-time=1d

# Limpar cache do apt
sudo apt-get clean
sudo apt-get autoremove
```

## 📞 Suporte

Se ainda tiver problemas:
1. Execute o script de limpeza novamente
2. Reinicie o sistema
3. Tente a instalação limpa
4. Verifique os logs: `docker-compose logs`

---

**💡 Dica**: Sempre execute a limpeza completa antes de uma nova tentativa de instalação para evitar conflitos.