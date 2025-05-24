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
  const query = `
    SELECT AVG(semana_total) AS promedio_semanal FROM (
      SELECT
        YEAR(fecha) AS anio,
        WEEK(fecha, 1) AS semana,
        SUM(total) AS semana_total
      FROM ventas
      WHERE MONTH(fecha) = MONTH(CURDATE())
        AND YEAR(fecha) = YEAR(CURDATE())
      GROUP BY anio, semana
    ) AS subconsulta;
  `;

  try {
    const [rows] = await pool.query(query);
    const promedio = rows[0].promedio_semanal ?? 0;
    res.json({ promedio });
  } catch (err) {
    console.error("Error al ejecutar la consulta:", err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  promedioVentasSemanales
};
