// controllers/loginController.js
const mysql = require('mysql2/promise'); // Protect to SQL Injection
const bcrypt = require('bcryptjs');
const db = require('../config/db.js');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM employees WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        const comparepasswords = await bcrypt.compare(password,user.password);

        if (!comparepasswords) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.user = {
            id: user.employee_id,
            username: `${user.first_name} ${user.last_name}`,
            role: user.role
        };
        console.log('Sesión guardada:', req.session.user); 

        // Redirección según el rol
        // Mantener el mismo código pero modificar la respuesta:
        if (user.role === 'admin') {
            return res.json({ redirectUrl: '/menu.html' });
        } else if (user.role === 'seller') {
            return res.json({ redirectUrl: '/cajero.html' });
        }

        // Si no coincide con ningún rol conocido
        res.json({
            message: 'Succesfully login',
            user: {
                id: user.employee_id,
                nombre: `${user.first_name} ${user.last_name}`,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

