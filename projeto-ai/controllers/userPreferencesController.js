const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class UserPreferencesController {
  // Obter preferências do usuário
  async getUserPreferences(req, res) {
    try {
      const preferences = await db.get('SELECT * FROM user_preferences WHERE id = ?', ['user_prefs']);
      
      if (!preferences) {
        // Se não existir, criar com valores padrão
        await db.run(`
          INSERT INTO user_preferences (id, active_professional_ids, schedule_generation_mode, starting_professional_id)
          VALUES (?, ?, ?, ?)
        `, ['user_prefs', '[]', 'daily', null]);
        
        return res.json({
          active_professional_ids: [],
          schedule_generation_mode: 'daily',
          starting_professional_id: null
        });
      }
      
      res.json({
        active_professional_ids: JSON.parse(preferences.active_professional_ids || '[]'),
        schedule_generation_mode: preferences.schedule_generation_mode || 'daily',
        starting_professional_id: preferences.starting_professional_id
      });
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar preferências do usuário
  async updateUserPreferences(req, res) {
    try {
      const { active_professional_ids, schedule_generation_mode, starting_professional_id } = req.body;
      
      // Validar dados
      if (active_professional_ids && !Array.isArray(active_professional_ids)) {
        return res.status(400).json({ error: 'active_professional_ids deve ser um array' });
      }
      
      if (schedule_generation_mode && !['daily', 'weekly'].includes(schedule_generation_mode)) {
        return res.status(400).json({ error: 'schedule_generation_mode deve ser "daily" ou "weekly"' });
      }
      
      // Construir query de atualização dinamicamente
      const updates = [];
      const values = [];
      
      if (active_professional_ids !== undefined) {
        updates.push('active_professional_ids = ?');
        values.push(JSON.stringify(active_professional_ids));
      }
      
      if (schedule_generation_mode !== undefined) {
        updates.push('schedule_generation_mode = ?');
        values.push(schedule_generation_mode);
      }
      
      if (starting_professional_id !== undefined) {
        updates.push('starting_professional_id = ?');
        values.push(starting_professional_id);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push('user_prefs');
      
      const query = `UPDATE user_preferences SET ${updates.join(', ')} WHERE id = ?`;
      await db.run(query, values);
      
      // Retornar preferências atualizadas
      const updatedPreferences = await db.get('SELECT * FROM user_preferences WHERE id = ?', ['user_prefs']);
      
      res.json({
        active_professional_ids: JSON.parse(updatedPreferences.active_professional_ids || '[]'),
        schedule_generation_mode: updatedPreferences.schedule_generation_mode || 'daily',
        starting_professional_id: updatedPreferences.starting_professional_id
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UserPreferencesController();
