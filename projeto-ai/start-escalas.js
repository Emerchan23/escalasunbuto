const { spawn } = require('child_process');

// Configurar variáveis de ambiente para o monólito
process.env.PORT = '4000';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api';
process.env.INTERNAL_API_URL = 'http://localhost:4000/api';

console.log('🚀 Iniciando sistema monolítico...');
console.log('📍 Porta: 4000');
console.log('🌐 URL: http://localhost:4000');

// Iniciar o servidor monolítico
const monolith = spawn('node', ['server-escalas.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '4000'
  }
});

monolith.on('error', (error) => {
  console.error('Erro ao iniciar servidor monolítico:', error);
});

monolith.on('close', (code) => {
  console.log(`Servidor monolítico encerrado com código ${code}`);
});

// Capturar sinais de interrupção
process.on('SIGINT', () => {
  console.log('\n🛑 Parando sistema monolítico...');
  monolith.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Parando sistema monolítico...');
  monolith.kill();
  process.exit(0);
});