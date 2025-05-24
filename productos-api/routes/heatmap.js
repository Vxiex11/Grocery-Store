const express = require('express');
const router = express.Router();
const heatmapController = require('../controllers/heatmapController');

router.get('/por-mes/:year/:month', heatmapController.obtenerVentasPorMes);
router.get('/meses-disponibles', heatmapController.obtenerMesesConVentas);

module.exports = router;
