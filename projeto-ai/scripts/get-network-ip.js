const os = require('os');

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

function getAllIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        ips.push({
          interface: name,
          ip: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return ips;
}

if (require.main === module) {
  console.log('='.repeat(50));
  console.log('INFORMAÇÕES DE REDE');
  console.log('='.repeat(50));
  
  const localIP = getLocalIP();
  console.log(`IP Principal: ${localIP}`);
  
  console.log('\nTodas as interfaces de rede:');
  const allIPs = getAllIPs();
  allIPs.forEach(info => {
    console.log(`  ${info.interface}: ${info.ip} (${info.netmask})`);
  });
  
  console.log('\nPara configurar o sistema:');
  console.log(`1. Backend: http://${localIP}:3001`);
  console.log(`2. Frontend: http://${localIP}:3000`);
  console.log(`3. Configure NEXT_PUBLIC_API_URL=http://${localIP}:3001/api`);
}

module.exports = { getLocalIP, getAllIPs };
