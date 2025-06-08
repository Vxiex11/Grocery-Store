const mysql = require("mysql2/promise");

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", //coloca tu contraseña de tu MySql
  database: "grocerystore", //Nombramiento de tu Base de datos
  port: 3306, //Puerto
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Crear un nuevo producto
exports.crearProducto = async (req, res) => {
  //manda "crarProducto" a routes/productos.js

  const {
    product_name,
    barcode,
    purchase_price,
    sale_price,
    existence,
    supplier_id,
  } = req.body;

  // Validación
  if (!product_name || !barcode) {
    return res
      .status(400)
      .json({ error: "Name and ID are required" });
  }

  if (
    isNaN(purchase_price) ||
    isNaN(sale_price) ||
    isNaN(existence) ||
    isNaN(supplier_id)
  ) {
    return res
      .status(400)
      .json({ error: "Numbers field has to valid" });
  }

  try {
    const connection = await pool.getConnection();

    // Verificar si el proveedor existe
    const [proveedor] = await connection.query(
      "SELECT supplier_id FROM suppliers WHERE supplier_id = ?",
      [supplier_id]
    );

    if (proveedor.length === 0) {
      connection.release();
      return res.status(400).json({
        error: "El proveedor especificado no existe",
        supplier_id_no_encontrado: supplier_id,
      });
    }

    // Verificar si el código de barras ya existe
    const [existing] = await connection.query(
      "SELECT product_id FROM products WHERE barcode = ?",
      [barcode]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: "El código de barras ya existe" });
    }

    // Insertar el nuevo producto
    const [result] = await connection.query(
      `INSERT INTO products
            (product_name, barcode, purchase_price, sale_price, existence, supplier_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        barcode,
        parseFloat(purchase_price),
        parseFloat(sale_price),
        parseInt(existence),
        parseInt(supplier_id),
      ]
    );

    connection.release();

    res.status(201).json({
      product_id: result.insertId,
      product_name,
      barcode,
      purchase_price: parseFloat(purchase_price),
      sale_price: parseFloat(sale_price),
      existence: parseInt(existence),
      supplier_id: parseInt(supplier_id),
      mensaje: "Producto creado exitosamente",
    });
  } catch (error) {
    console.error("Error al insertar producto:", error);
    res.status(500).json({
      error: "Error al guardar el producto",
      detalles:
        process.env.NODE_ENV === "development"
          ? {
              mensaje: error.message,
              codigo: error.code,
              sqlState: error.sqlState,
            }
          : undefined,
    });
  }
};

//Obtener un producto por ID
exports.obtenerProducto = async (req, res) => {
  try {
    const searchTerm = req.query.q || '';

    if (searchTerm.length < 2) {
      return res.json([]);
    }

    console.log('Ejecutando consulta para:', searchTerm); // Log para depuración

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT product_id, product_name, sale_price, barcode, purchase_price, existence, supplier_id
       FROM products
       WHERE product_name LIKE CONCAT('%', ?, '%')
       LIMIT 5`,
      [searchTerm]
    );

    connection.release();

    console.log('Resultados encontrados:', rows.length); // Log para depuración

    res.json(rows);
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
      sqlError: error.sqlMessage
    });
  }
};


// Actualizar un producto existente
exports.actualizarProducto = async (req, res) => {
  //exporta a routes/productos.js
  const { id } = req.params;
  const {
    product_name,
    barcode,
    purchase_price,
    sale_price,
    existence,
    supplier_id,
  } = req.body;

  // Validación básica
  if (
    !product_name ||
    !barcode ||
    !purchase_price ||
    !sale_price ||
    !existence ||
    !supplier_id
  ) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `UPDATE products SET
            product_name = ?,
            barcode = ?,
            purchase_price = ?,
            sale_price = ?,
            existence = ?,
            supplier_id = ?
            WHERE product_id = ?`,
      [
        product_name,
        barcode,
        purchase_price,
        sale_price,
        existence,
        supplier_id,
        id,
      ]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoActualizado = {
      product_id: parseInt(id),
      product_name,
      barcode,
      purchase_price: parseFloat(purchase_price),
      sale_price: parseFloat(sale_price),
      existence: parseInt(existence),
      supplier_id: parseInt(supplier_id),
    };

    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el producto en la base de datos" });
  }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    // Primero eliminar los detalles de venta relacionados
    await connection.query(`DELETE FROM sale_details WHERE product_id = ?`, [
      id,
    ]);

    // Luego eliminar el producto
    const [result] = await connection.query(
      `DELETE FROM products WHERE product_id = ?`,
      [id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      error: "Error al eliminar el producto de la base de datos",
      detalles:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Listar todos los productos
exports.listarProductos = async (req, res) => {
  //exporta a routes/productos.js
  try {
    const connection = await pool.getConnection();
    res.setHeader('Content-Type', 'application/json'); // ← Añade esto

    const [rows] = await connection.query(`SELECT * FROM products`);

    connection.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los productos de la base de datos" });
  }
};

// get product by id (GET /api/productos/:id)
exports.obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT * FROM products WHERE product_id = ?`,
      [id]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]); // return the first product
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error en el servidor", detalles: error.message });
  }
};
