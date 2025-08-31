// controllers/professionalsController.js
const db = require('../database'); // Importa a instância única do banco de dados
const { v4: uuidv4 } = require('uuid');

exports.getAllProfessionals = async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM professionals ORDER BY name COLLATE NOCASE", []);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProfessionalById = async (req, res) => {
    const { id } = req.params;
    try {
        const row = await db.get("SELECT * FROM professionals WHERE id = ?", [id]);
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: "Professional not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProfessional = async (req, res) => {
    const { name, color, default_hours, phone } = req.body; // Adiciona phone
    if (!name || !color) {
        return res.status(400).json({ error: "Name and color are required" });
    }
    const id = uuidv4();
    try {
        await db.run("INSERT INTO professionals (id, name, color, default_hours, phone) VALUES (?, ?, ?, ?, ?)",
            [id, name, color, default_hours || 12, phone || null]); // Inclui phone
        res.status(201).json({ 
            id: id, 
            name, 
            color, 
            default_hours: default_hours || 12, 
            phone: phone || null, // Inclui phone na resposta
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfessional = async (req, res) => {
    const { id } = req.params;
    const { name, color, default_hours, phone } = req.body; // Adiciona phone
    if (!name || !color) {
        return res.status(400).json({ error: "Name and color are required" });
    }
    try {
        const result = await db.run("UPDATE professionals SET name = ?, color = ?, default_hours = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [name, color, default_hours || 12, phone || null, id]); // Inclui phone
        if (result.changes > 0) {
            res.json({ 
                message: "Professional updated successfully", 
                id, 
                name, 
                color, 
                default_hours: default_hours || 12,
                phone: phone || null // Inclui phone na resposta
            });
        } else {
            res.status(404).json({ message: "Professional not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProfessional = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run("DELETE FROM professionals WHERE id = ?", [id]);
        if (result.changes > 0) {
            res.json({ message: "Professional deleted successfully", id });
        } else {
            res.status(404).json({ message: "Professional not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
