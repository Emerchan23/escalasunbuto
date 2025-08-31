const express = require('express');
const router = express.Router();
const professionalsController = require('../controllers/professionalsController');

router.get('/', professionalsController.getAllProfessionals);
router.get('/:id', professionalsController.getProfessionalById);
router.post('/', professionalsController.createProfessional);
router.put('/:id', professionalsController.updateProfessional);
router.delete('/:id', professionalsController.deleteProfessional);

module.exports = router;
