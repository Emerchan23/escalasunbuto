# Sistema de Escalas - Instalação Automática

## 🚀 Instalação Completamente Automática

Este sistema foi configurado para instalação **100% automática** sem necessidade de digitar códigos ou comandos manuais.

### Pré-requisitos
- Docker Desktop instalado
- Docker Compose disponível

### Instalação Automática

#### Opção 1: Docker Compose (Recomendado)
```bash
# Navegue até a pasta do projeto
cd "c:\Users\skile\OneDrive\Área de Trabalho\SISTEMAS EM PRODUÇÃO\escalas"

# Instalação automática completa
docker-compose -f docker-compose-escalas.yml up -d
```

#### Opção 2: Via NPM Scripts
```bash
# Navegue até a pasta do projeto
cd "c:\Users\skile\OneDrive\Área de Trabalho\SISTEMAS EM PRODUÇÃO\escalas\projeto-ai"

# Instalação automática completa
npm run setup:auto
```

### ✅ O que acontece automaticamente:

1. **Build Multi-Stage**: Otimizado para produção
2. **Instalação de Dependências**: Todas as dependências são instaladas automaticamente
3. **Compilação**: Better-sqlite3 é recompilado automaticamente
4. **Build do Next.js**: Aplicação é buildada automaticamente
5. **Inicialização do Banco**: Banco SQLite é criado e inicializado automaticamente
6. **Configuração de Segurança**: Usuário não-root configurado automaticamente
7. **Health Check**: Monitoramento automático da aplicação
8. **Restart Policy**: Reinicialização automática em caso de falha

### 🌐 Acesso

Após a instalação automática, acesse:
- **Aplicação**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

### 📊 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose -f docker-compose-escalas.yml logs -f

# Parar o sistema
docker-compose -f docker-compose-escalas.yml down

# Reiniciar o sistema
docker-compose -f docker-compose-escalas.yml restart

# Verificar status
docker-compose -f docker-compose-escalas.yml ps
```

### 🔧 Scripts NPM Disponíveis

```bash
npm run setup:auto      # Instalação automática completa
npm run docker:build    # Build automático
npm run docker:up       # Iniciar sistema
npm run docker:down     # Parar sistema
npm run docker:restart  # Reiniciar sistema
npm run docker:logs     # Ver logs
npm run health-check    # Verificar saúde da aplicação (Linux/Mac)
```

### 🎯 Características da Instalação Automática

- **Zero Configuração Manual**: Tudo é configurado automaticamente
- **Multi-Stage Build**: Otimização automática para produção
- **Segurança**: Usuário não-root configurado automaticamente
- **Persistência**: Dados salvos automaticamente em volumes
- **Monitoramento**: Health checks automáticos
- **Recovery**: Reinicialização automática em falhas
- **Logs**: Sistema de logs automático

### 🛠️ Troubleshooting

Se algo não funcionar:

1. Verifique se o Docker está rodando
2. Execute: `docker-compose -f docker-compose-escalas.yml logs`
3. Verifique o health check:
   - **Linux/Mac**: `curl http://localhost:4000/api/health`
   - **Windows**: `Invoke-WebRequest -Uri http://localhost:4000/api/health`

---

**✨ Instalação 100% Automática - Sem Comandos Manuais Necessários! ✨**