// controllers/configController.js
const db = require('../database'); // Importa a instância única do banco de dados

exports.getConfig = async (req, res) => {
    try {
        const row = await db.get("SELECT * FROM config WHERE id = 'app_config'", []);
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: "Config not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateConfig = async (req, res) => {
    const { company_name, department_name, system_title } = req.body;
    if (!company_name || !department_name || !system_title) {
        return res.status(400).json({ error: "All config fields are required" });
    }

    try {
        const result = await db.run(
            `UPDATE config SET company_name = ?, department_name = ?, system_title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'app_config'`,
            [company_name, department_name, system_title]
        );
        if (result.changes > 0) {
            res.json({ message: "Config updated successfully", company_name, department_name, system_title });
        } else {
            res.status(404).json({ message: "Config not found or could not be updated" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
