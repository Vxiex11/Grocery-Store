const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Hola3245",
  database: "sistema_ventas",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 👇 Aquí va la corrección
const promedioVentasSemanales = async (req, res) => {
  try {
    const queryActual = `
      SELECT AVG(semana_total) AS promedio_semanal
      FROM (
        SELECT YEAR(fecha) AS anio, WEEK(fecha, 1) AS semana, SUM(total) AS semana_total
        FROM ventas
        WHERE MONTH(fecha) = MONTH(CURDATE())
          AND YEAR(fecha) = YEAR(CURDATE())
        GROUP BY anio, semana
      ) AS subconsulta;
    `;

    const queryAnterior = `
      SELECT AVG(semana_total) AS promedio_semanal
      FROM (
        SELECT YEAR(fecha) AS anio, WEEK(fecha, 1) AS semana, SUM(total) AS semana_total
        FROM ventas
        WHERE MONTH(fecha) = MONTH(CURDATE() - INTERVAL 1 MONTH)
          AND YEAR(fecha) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        GROUP BY anio, semana
      ) AS subconsulta;
    `;

    const [[actual]] = await pool.query(queryActual);
    const [[anterior]] = await pool.query(queryAnterior);

    const actualProm = actual.promedio_semanal ?? 0;
    const anteriorProm = anterior.promedio_semanal ?? 0;

    let variacion = 0;
    if (anteriorProm > 0) {
      variacion = ((actualProm - anteriorProm) / anteriorProm) * 100;
    }

    res.json({
      promedio_actual: actualProm,
      promedio_anterior: anteriorProm,
      variacion: variacion.toFixed(2)
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const promedioVentasMensuales = async (req, res) => {
  try {
    const queryActual = `
      SELECT SUM(total) AS total_mes_actual
      FROM ventas
      WHERE MONTH(fecha) = MONTH(CURDATE())
        AND YEAR(fecha) = YEAR(CURDATE());
    `;

    const queryAnterior = `
      SELECT SUM(total) AS total_mes_anterior
      FROM ventas
      WHERE MONTH(fecha) = MONTH(CURDATE() - INTERVAL 1 MONTH)
        AND YEAR(fecha) = YEAR(CURDATE() - INTERVAL 1 MONTH);
    `;

    const [[actual]] = await pool.query(queryActual);
    const [[anterior]] = await pool.query(queryAnterior);

    const actualTotal = actual.total_mes_actual ?? 0;
    const anteriorTotal = anterior.total_mes_anterior ?? 0;

    let variacion = 0;
    if (anteriorTotal > 0) {
      variacion = ((actualTotal - anteriorTotal) / anteriorTotal) * 100;
    }

    res.json({
      promedio_actual: actualTotal,
      promedio_anterior: anteriorTotal,
      variacion: variacion.toFixed(2)
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const promedioVentasAnuales = async (req, res) => {
  try {
    const queryActual = `
      SELECT SUM(total) AS total_anio_actual
      FROM ventas
      WHERE YEAR(fecha) = YEAR(CURDATE());
    `;

    const queryAnterior = `
      SELECT SUM(total) AS total_anio_anterior
      FROM ventas
      WHERE YEAR(fecha) = YEAR(CURDATE() - INTERVAL 1 YEAR);
    `;

    const [[actual]] = await pool.query(queryActual);
    const [[anterior]] = await pool.query(queryAnterior);

    const actualTotal = actual.total_anio_actual ?? 0;
    const anteriorTotal = anterior.total_anio_anterior ?? 0;

    let variacion = 0;
    if (anteriorTotal > 0) {
      variacion = ((actualTotal - anteriorTotal) / anteriorTotal) * 100;
    }

    res.json({
      promedio_actual: actualTotal,
      promedio_anterior: anteriorTotal,
      variacion: variacion.toFixed(2)
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  promedioVentasSemanales,
  promedioVentasMensuales,
  promedioVentasAnuales
};
