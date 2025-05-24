const express = require('express');
const router = express.Router();
const { promedioVentasSemanales } = require('../controllers/analisisVentasController');

router.get('/promedio-semanal', promedioVentasSemanales);

module.exports = router;
