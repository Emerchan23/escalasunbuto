# 🏥 Sistema de Escalas - Ubuntu

## 📋 Descrição

Sistema completo de gerenciamento de escalas médicas desenvolvido com Next.js, Node.js e SQLite, otimizado para instalação automática no Ubuntu.

## 🚀 Instalação Rápida no Ubuntu

### Pré-requisitos
- Ubuntu 18.04 LTS ou superior
- Usuário com privilégios sudo
- Conexão com internet

### Instalação Automática (Recomendada)

```bash
# 1. Clonar o repositório
git clone https://github.com/Emerchan23/escalasunbuto.git
cd escalasunbuto

# 2. Executar instalação automática
chmod +x install-ubuntu.sh
./install-ubuntu.sh

# 3. Navegar para o diretório do projeto
cd projeto-ai

# 4. Iniciar o sistema
npm run docker:up

# 5. Acessar o sistema
# http://localhost:4000
```

## 🐳 Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Banco de Dados**: SQLite
- **Containerização**: Docker + Docker Compose
- **UI Components**: Radix UI, Shadcn/ui

## 📁 Estrutura do Projeto

```
escalasunbuto/
├── install-ubuntu.sh          # Script de instalação automática
├── INSTALACAO-UBUNTU.md       # Documentação detalhada
├── docker-compose-escalas.yml # Configuração Docker
├── Dockerfile-escalas         # Imagem Docker
├── data/                      # Banco de dados
│   └── schedule.db
└── projeto-ai/                # Código fonte
    ├── app/                   # Páginas Next.js
    ├── components/            # Componentes React
    ├── controllers/           # Controllers da API
    ├── routes/                # Rotas da API
    ├── hooks/                 # Hooks customizados
    └── lib/                   # Utilitários
```

## 🛠️ Comandos Úteis

**IMPORTANTE**: Execute todos os comandos npm no diretório `projeto-ai`

```bash
# Navegar para o diretório correto
cd escalasunbuto/projeto-ai

# Gerenciar containers
npm run docker:up       # Iniciar sistema
npm run docker:down     # Parar sistema
npm run docker:logs     # Ver logs
npm run docker:restart  # Reiniciar

# Desenvolvimento
npm run dev             # Modo desenvolvimento
npm run build           # Build produção
npm run setup:auto      # Reinstalar completo

# Monitoramento
npm run health-check    # Verificar saúde
curl http://localhost:4000/api/health
```

## 🌐 Acesso

- **Sistema Principal**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/health
- **Banco de Dados**: SQLite em `./data/schedule.db`

## 📊 Funcionalidades

- ✅ **Gerenciamento de Profissionais**
- ✅ **Criação de Escalas Mensais**
- ✅ **Calendário Interativo**
- ✅ **Histórico de Alterações**
- ✅ **Tema Claro/Escuro**
- ✅ **Interface Responsiva**
- ✅ **API RESTful**
- ✅ **Containerização Docker**
- ✅ **Instalação Automática**

## 🔧 Instalação Manual

Se preferir instalar manualmente:

```bash
# 1. Instalar dependências do sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nodejs npm docker.io docker-compose

# 2. Configurar Docker
sudo usermod -aG docker $USER
newgrp docker

# 3. Instalar projeto
cd projeto-ai
npm install --legacy-peer-deps
npm run setup:auto
```

## 🛠️ Solução de Problemas

### Porta 4000 em uso
```bash
sudo lsof -i :4000
sudo kill -9 <PID>
```

### Permissões Docker
```bash
sudo usermod -aG docker $USER
newgrp docker
# ou reiniciar o sistema
```

### Limpar instalação
```bash
npm run docker:down
docker system prune -f
npm run setup:auto
```

## 🗑️ Desinstalação

### Desinstalação Completa
```bash
cd escalasunbuto
chmod +x cleanup-ubuntu.sh
./cleanup-ubuntu.sh
```

### Desinstalação Rápida
```bash
cd escalasunbuto/projeto-ai
npm run docker:down
cd $HOME && rm -rf escalasunbuto/
```

## 📚 Documentação

- [Instalação Ubuntu](INSTALACAO-UBUNTU.md) - Guia completo
- [Instalação Automática](INSTALACAO-AUTOMATICA.md) - Windows/Docker
- [Limpeza Ubuntu](LIMPEZA-UBUNTU.md) - Guia de limpeza completa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Emerchan23**
- GitHub: [@Emerchan23](https://github.com/Emerchan23)
- Repositório: [escalasunbuto](https://github.com/Emerchan23/escalasunbuto)

---

## 🚀 Deploy Rápido

```bash
# 1. Clonar repositório
git clone https://github.com/Emerchan23/escalasunbuto.git
cd escalasunbuto

# 2. Executar instalação automática
chmod +x install-ubuntu.sh
./install-ubuntu.sh

# 3. Navegar para o projeto e iniciar
cd projeto-ai
npm run docker:up
```

**🎉 Sistema rodando em http://localhost:4000**