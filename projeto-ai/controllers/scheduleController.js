// controllers/scheduleController.js
const db = require('../database'); // Importa a instância única do banco de dados
const { v4: uuidv4 } = require('uuid');

exports.getAllScheduleEntries = async (req, res) => {
    const { year, month } = req.query;
    let query = `
        SELECT se.*, p.name AS professional_name, p.color AS professional_color
        FROM schedule_entries se
        JOIN professionals p ON se.professional_id = p.id
    `;
    const params = [];

    if (year && month) {
        const monthStr = String(month).padStart(2, '0');
        query += ` WHERE strftime('%Y-%m', se.date) = ?`;
        params.push(`${year}-${monthStr}`);
    }

    query += ` ORDER BY se.date ASC`;

    try {
        const rows = await db.all(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOrUpdateScheduleEntry = async (req, res) => {
    const { date, professionalId, hours, observation } = req.body;
    if (!date || !professionalId || !hours) {
        return res.status(400).json({ error: "Date, professionalId, and hours are required" });
    }

    try {
        const row = await db.get("SELECT id FROM schedule_entries WHERE date = ?", [date]);

        if (row) {
            const result = await db.run(
                "UPDATE schedule_entries SET professional_id = ?, hours = ?, observation = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [professionalId, hours, observation || null, row.id]
            );
            res.json({ message: "Schedule entry updated successfully", id: row.id, date, professionalId, hours, observation });
        } else {
            const id = uuidv4();
            await db.run(
                "INSERT INTO schedule_entries (id, date, professional_id, hours, observation) VALUES (?, ?, ?, ?, ?)",
                [id, date, professionalId, hours, observation || null]
            );
            res.status(201).json({ id: id, date, professionalId, hours, observation, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteScheduleEntry = async (req, res) => {
    const { date } = req.params;
    try {
        const result = await db.run("DELETE FROM schedule_entries WHERE date = ?", [date]);
        if (result.changes > 0) {
            res.json({ message: "Schedule entry deleted successfully", date });
        } else {
            res.status(404).json({ message: "Schedule entry for this date not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearMonthSchedule = async (req, res) => {
    const { year, month } = req.body;
    if (!year || !month) {
        return res.status(400).json({ error: "Year and month are required" });
    }
    const monthStr = String(month).padStart(2, '0');
    const datePrefix = `${year}-${monthStr}`;

    try {
        const result = await db.run(`DELETE FROM schedule_entries WHERE strftime('%Y-%m', date) = ?`, [datePrefix]);
        res.json({ message: `All schedule entries for ${datePrefix} cleared successfully`, deletedCount: result.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
