// controllers/historyController.js
const db = require('../database'); // Importa a instância única do banco de dados
const { v4: uuidv4 } = require('uuid');

exports.getAllHistoryRecords = async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM history ORDER BY created_at DESC", []);
        const parsedRows = rows.map(row => ({
            ...row,
            schedule_data: JSON.parse(row.schedule_data),
            professionals_data: JSON.parse(row.professionals_data)
        }));
        res.json(parsedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveHistoryRecord = async (req, res) => {
    const { month_year, schedule_data, professionals_data } = req.body;
    if (!month_year || !schedule_data || !professionals_data) {
        return res.status(400).json({ error: "Month year, schedule data, and professionals data are required" });
    }

    const id = uuidv4();
    const scheduleDataString = JSON.stringify(schedule_data);
    const professionalsDataString = JSON.stringify(professionals_data);

    try {
        const row = await db.get("SELECT id FROM history WHERE month_year = ?", [month_year]);

        if (row) {
            await db.run(
                "UPDATE history SET schedule_data = ?, professionals_data = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [scheduleDataString, professionalsDataString, row.id]
            );
            res.json({ message: "History record updated successfully", id: row.id, month_year });
        } else {
            await db.run(
                "INSERT INTO history (id, month_year, schedule_data, professionals_data) VALUES (?, ?, ?, ?)",
                [id, month_year, scheduleDataString, professionalsDataString]
            );
            res.status(201).json({ id: id, month_year, created_at: new Date().toISOString() });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteHistoryRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run("DELETE FROM history WHERE id = ?", [id]);
        if (result.changes > 0) {
            res.json({ message: "History record deleted successfully", id });
        } else {
            res.status(404).json({ message: "History record not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
