// server-escalas.js - Sistema de Escala de Sobreaviso
const express = require('express');
const next = require('next');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');
const db = require('./database'); // Importa a instância única do banco de dados

// Importar rotas do backend
const professionalsRoutes = require('./routes/professionals');
const scheduleRoutes = require('./routes/schedule');
const historyRoutes = require('./routes/history');
const configRoutes = require('./routes/config');
const userPreferencesRoutes = require('./routes/userPreferences');

// Configuração do Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 4000;

// Função para obter IP da rede local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Pular endereços internos e não IPv4
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Inicializar servidor monolítico
async function startMonolithServer() {
  try {
    // Preparar Next.js
    console.log('Preparando Next.js...');
    await nextApp.prepare();
    
    // Inicializar banco de dados
    console.log('Inicializando banco de dados...');
    await db.initializeTables();
    
    const app = express();
    
    // Middleware
    app.use(cors()); // Habilita CORS para todas as origens
    app.use(express.json()); // Faz o parse de corpos de requisição JSON
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Health check endpoint para monitoramento automático
    app.get('/api/health', async (req, res) => {
      try {
        // Verificar se o banco de dados está acessível usando a interface do DatabaseWrapper
        await db.get('SELECT 1');
        
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: 'connected',
          version: process.env.npm_package_version || '1.0.0'
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });
    
    // Middleware para log de requisições
    app.use((req, res, next) => {
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${clientIP}`);
      next();
    });
    
    // Rotas da API (backend)
    app.use('/api/professionals', professionalsRoutes);
    app.use('/api/schedule', scheduleRoutes);
    app.use('/api/history', historyRoutes);
    app.use('/api/config', configRoutes);
    app.use('/api/user-preferences', userPreferencesRoutes);
    
    // Rota de status da API
    app.get('/api/status', (req, res) => {
      const localIP = getLocalIP();
      res.json({
        status: 'OK',
        message: 'Sistema de Escala de Sobreaviso - Monólito funcionando',
        timestamp: new Date().toISOString(),
        version: '2.0.0-escalas',
        server_ip: localIP,
        port: PORT,
        network_access: `http://${localIP}:${PORT}`,
        architecture: 'Monolítico (Frontend + Backend integrados)'
      });
    });
    
    // Middleware para rotas API não encontradas será tratado pelo Next.js
    
    // Servir arquivos estáticos do Next.js
    app.use('/_next', express.static(path.join(__dirname, '.next')));
    
    // Todas as outras rotas são tratadas pelo Next.js (frontend)
    app.use((req, res) => {
      return handle(req, res);
    });
    
    // Middleware de tratamento de erros
    app.use((err, req, res, next) => {
      console.error('Erro no servidor:', err);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
      });
    });
    
    const localIP = getLocalIP();
    
    // Iniciar servidor em todas as interfaces (0.0.0.0)
    app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(70));
      console.log('🚀 SISTEMA DE ESCALA DE SOBREAVISO - MONÓLITO');
      console.log('='.repeat(70));
      console.log(`✅ Servidor monolítico rodando na porta ${PORT}`);
      console.log(`🌐 Acesso local: http://localhost:${PORT}`);
      console.log(`🌐 Acesso na rede: http://${localIP}:${PORT}`);
      console.log(`📊 Status da API: http://${localIP}:${PORT}/api/status`);
      console.log(`💾 Banco de dados: SQLite inicializado`);
      console.log(`🎨 Frontend: Next.js integrado`);
      console.log(`⚙️  Backend: Express.js integrado`);
      console.log('='.repeat(70));
      console.log('📋 INSTRUÇÕES PARA REDE LOCAL:');
      console.log(`   1. Compartilhe este IP com outros usuários: ${localIP}`);
      console.log(`   2. Outros computadores devem acessar: http://${localIP}:${PORT}`);
      console.log(`   3. Tudo funciona em uma única porta: ${PORT}`);
      console.log('='.repeat(70));
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor monolítico:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para encerramento gracioso
process.on('SIGINT', async () => {
  try {
    await db.close();
    console.log('Conexão com banco de dados fechada. Servidor monolítico encerrando.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await db.close();
    console.log('Conexão com banco de dados fechada. Servidor monolítico encerrando.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
    process.exit(1);
  }
});

// Iniciar servidor monolítico
startMonolithServer();

module.exports = { app: express(), nextApp };