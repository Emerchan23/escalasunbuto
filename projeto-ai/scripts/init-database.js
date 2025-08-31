// scripts/init-database.js
const db = require('../database'); // Importa a instância única do banco de dados

async function initDbAndClose() {
    try {
        console.log("Iniciando script de inicialização do banco de dados...");
        await db.initializeTables(); // Chama o método na instância única
        console.log("Inicialização do banco de dados concluída.");
    } catch (error) {
        console.error("Erro durante a inicialização do banco de dados:", error);
        process.exit(1); // Sai com código de erro
    } finally {
        // Fecha a conexão do banco de dados usando o método close da instância
        await db.close(); // Aguarda a promessa de fechamento
        console.log('Script de inicialização finalizado.');
        process.exit(0); // Sai com sucesso
    }
}

initDbAndClose();
