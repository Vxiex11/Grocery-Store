const mysql = require("mysql2/promise");

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Hola3245", //coloca tu contraseña de tu MySql
  database: "sistema_ventas", //Nombramiento de tu Base de datos
  port: 3306, //Puerto
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const obtenerVentasPorMes = async (req, res) => {
  const { year, month } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(fecha) as fecha,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_recaudado
      FROM ventas
      WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?
      GROUP BY DATE(fecha)
    `, [year, month]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

const obtenerMesesConVentas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        DATE_FORMAT(fecha, '%Y-%m') AS mes
      FROM ventas
      ORDER BY mes DESC
    `);

    res.json(rows); // [{ mes: '2025-05' }, { mes: '2025-04' }, ...]
  } catch (error) {
    console.error('Error al obtener meses con ventas:', error);
    res.status(500).json({ error: 'Error al obtener meses con ventas' });
  }
};

module.exports = {
  obtenerVentasPorMes,
  obtenerMesesConVentas
};