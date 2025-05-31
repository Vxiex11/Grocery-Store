const express = require("express");
const router = express.Router();
const {
  promedioVentasSemanales,
  promedioVentasMensuales,
  promedioVentasAnuales
} = require("../controllers/analisisVentasController"); // Asegúrate de que la ruta al controller es correcta

router.get("/promedio-semanal", promedioVentasSemanales);
router.get("/promedio-mensual", promedioVentasMensuales);
router.get("/promedio-anual", promedioVentasAnuales);

module.exports = router;