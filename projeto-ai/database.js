// database.js - Sistema de Escala de Sobreaviso
const Database = require('better-sqlite3');
const path = require('path');

// Usar diretório de dados externo ao container para persistência
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../database/schedule.db');

let dbInstance = null; // Esta variável irá armazenar a instância única do banco de dados

class DatabaseWrapper {
  constructor() {
    // Se já existe uma instância, retorna a existente (padrão Singleton)
    if (dbInstance) {
      return dbInstance;
    }

    // Cria a conexão com o banco de dados SQLite
    try {
      this.db = new Database(DB_PATH);
      console.log('Conectado ao banco de dados SQLite.');
    } catch (err) {
      console.error('Erro ao abrir o banco de dados:', err.message);
      throw err;
    }

    // Métodos adaptados para better-sqlite3
    this.run = (sql, params = []) => {
      try {
        const result = this.db.prepare(sql).run(params);
        return Promise.resolve({ id: result.lastInsertRowid, changes: result.changes });
      } catch (err) {
        return Promise.reject(err);
      }
    };

    this.get = (sql, params = []) => {
      try {
        const result = this.db.prepare(sql).get(params);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    this.all = (sql, params = []) => {
      try {
        const result = this.db.prepare(sql).all(params);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    // Método para fechar a conexão do banco de dados
    this.close = () => {
      try {
        if (this.db) {
          this.db.close();
          console.log('Conexão com banco de dados fechada.');
          dbInstance = null; // Limpa a instância única ao fechar
        }
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    // Método para inicializar as tabelas do banco de dados
    this.initializeTables = async () => {
      try {
        await this.run(`
          CREATE TABLE IF NOT EXISTS professionals (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            default_hours INTEGER DEFAULT 12,
            phone TEXT, -- Novo campo telefone
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Adicionar coluna phone se não existir (para bancos existentes)
        try {
          await this.run(`ALTER TABLE professionals ADD COLUMN phone TEXT`);
        } catch (err) {
          // Coluna já existe, ignorar erro
        }
        
        await this.run(`
          CREATE TABLE IF NOT EXISTS schedule_entries (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL UNIQUE,
            professional_id TEXT NOT NULL,
            hours INTEGER NOT NULL,
            observation TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
          )
        `);
        await this.run(`
          CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            month_year TEXT NOT NULL UNIQUE,
            schedule_data TEXT NOT NULL, -- Armazenando como string JSON
            professionals_data TEXT NOT NULL, -- Armazenando como string JSON
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await this.run(`
          CREATE TABLE IF NOT EXISTS config (
            id TEXT PRIMARY KEY DEFAULT 'app_config',
            company_name TEXT DEFAULT 'Nome da Empresa',
            department_name TEXT DEFAULT 'Nome do Departamento',
            system_title TEXT DEFAULT 'Título do Sistema',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await this.run(`
          CREATE TABLE IF NOT EXISTS user_preferences (
            id TEXT PRIMARY KEY DEFAULT 'user_prefs',
            active_professional_ids TEXT DEFAULT '[]', -- JSON array of active professional IDs
            schedule_generation_mode TEXT DEFAULT 'daily', -- 'daily' or 'weekly'
            starting_professional_id TEXT DEFAULT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await this.run(`
          INSERT OR IGNORE INTO user_preferences (id) VALUES ('user_prefs')
        `);
        await this.run(`
          INSERT OR IGNORE INTO config (id, company_name, department_name, system_title) 
          VALUES (?, ?, ?, ?)
        `, ['app_config', 'SECRETARIA MUNICIPAL DE SAÚDE DE CHAPADÃO DO CÉU', 'DEPARTAMENTO DE INFORMÁTICA', 'Sistema de Escala de Sobreaviso - TI']);

        console.log('Tabelas inicializadas com sucesso!');
      } catch (error) {
        console.error('Erro ao inicializar tabelas:', error);
        throw error;
      }
    };

    dbInstance = this; // Define esta instância como a única
  }
}

// Exporta a instância única da classe DatabaseWrapper
module.exports = new DatabaseWrapper();
