#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * Script para detectar automaticamente o IP do host Docker
 * e configurar as variáveis de ambiente adequadamente
 */

function detectHostIP() {
    console.log('🔍 Detectando IP do host Docker...');
    
    let hostIP = null;
    
    try {
        // Método 1: Tentar obter IP real do host via rota para 8.8.8.8
        const routeOutput = execSync('ip route get 8.8.8.8', { encoding: 'utf8' }).trim();
        const srcMatch = routeOutput.match(/src ([0-9.]+)/);
        if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('172.') && !srcMatch[1].startsWith('127.')) {
            hostIP = srcMatch[1];
            console.log(`✅ IP detectado via rota externa: ${hostIP}`);
        }
    } catch (error) {
        console.log('⚠️  Método rota externa falhou:', error.message);
    }
    
    // Método 2 desabilitado - host.docker.internal não está retornando IP correto
    // if (!hostIP) {
    //     try {
    //         const hostInternalOutput = execSync('getent hosts host.docker.internal', { encoding: 'utf8' }).trim();
    //         const ipMatch = hostInternalOutput.match(/^([0-9.]+)/);
    //         if (ipMatch && ipMatch[1] && !ipMatch[1].startsWith('172.') && !ipMatch[1].startsWith('127.')) {
    //             hostIP = ipMatch[1];
    //             console.log(`✅ IP detectado via host.docker.internal: ${hostIP}`);
    //         }
    //     } catch (error) {
    //         console.log('⚠️  Método host.docker.internal falhou:', error.message);
    //     }
    // }
    
    if (!hostIP) {
        try {
            // Método 3: Usar IP fixo do .env.local se existir
            if (fs.existsSync('/app/.env.local')) {
                const envContent = fs.readFileSync('/app/.env.local', 'utf8');
                const apiUrlMatch = envContent.match(/NEXT_PUBLIC_API_URL=http:\/\/([0-9.]+):4000\/api/);
                if (apiUrlMatch && apiUrlMatch[1] && !apiUrlMatch[1].startsWith('172.') && !apiUrlMatch[1].startsWith('127.')) {
                    hostIP = apiUrlMatch[1];
                    console.log(`✅ IP obtido do .env.local existente: ${hostIP}`);
                }
            }
        } catch (error) {
            console.log('⚠️  Método .env.local falhou:', error.message);
        }
    }
    
    if (!hostIP) {
        // Fallback: usar IP fixo da máquina host
        hostIP = '192.168.8.138'; // IP fixo como fallback
        console.log('⚠️  Usando fallback: IP fixo da máquina host (192.168.8.138)');
    }
    
    return hostIP;
}

function updateEnvironmentFile(hostIP) {
    const envContent = `NEXT_PUBLIC_API_URL=http://${hostIP}:4000/api
 INTERNAL_API_URL=http://localhost:4000/api
 PORT=4000
 `;
    
    try {
        fs.writeFileSync('/app/.env.local', envContent);
        console.log(`✅ Arquivo .env.local atualizado com IP: ${hostIP}`);
    } catch (error) {
        console.log('⚠️  Erro ao atualizar .env.local:', error.message);
    }
}

function setEnvironmentVariables(hostIP) {
    process.env.NEXT_PUBLIC_API_URL = `http://${hostIP}:4000/api`;
    process.env.INTERNAL_API_URL = `http://localhost:4000/api`;
    process.env.PORT = '4000';
    
    console.log('✅ Variáveis de ambiente configuradas:');
    console.log(`   NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    console.log(`   INTERNAL_API_URL: ${process.env.INTERNAL_API_URL}`);
    console.log(`   PORT: ${process.env.PORT}`);
}

function main() {
    console.log('========================================');
    console.log('  DETECÇÃO AUTOMÁTICA DE IP - DOCKER');
    console.log('  Sistema de Escala de Sobreaviso');
    console.log('========================================');
    
    const hostIP = detectHostIP();
    
    // Atualizar arquivo .env.local
    updateEnvironmentFile(hostIP);
    
    // Configurar variáveis de ambiente
    setEnvironmentVariables(hostIP);
    
    console.log('========================================');
    console.log('✅ Configuração automática concluída!');
    console.log(`🌐 Sistema monolítico acessível em: http://${hostIP}:4000`);
    console.log(`🔗 API integrada disponível em: http://${hostIP}:4000/api`);
    console.log('========================================');
    
    return hostIP;
}

if (require.main === module) {
    main();
}

module.exports = { detectHostIP, updateEnvironmentFile, setEnvironmentVariables };