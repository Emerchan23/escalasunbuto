const express = require('express');
const router = express.Router();
const userPreferencesController = require('../controllers/userPreferencesController');

// GET /api/user-preferences - Obter preferências do usuário
router.get('/', userPreferencesController.getUserPreferences);

// PUT /api/user-preferences - Atualizar preferências do usuário
router.put('/', userPreferencesController.updateUserPreferences);

module.exports = router;