// import bcrypt and connection with the database 
const bcrypt = require('bcryptjs');
const db = require('../config/db'); 

// Functions to validate data

// Function to validate email
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// Function to validate name
const validateName = (name) => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s'-]+$/.test(name);
// Function to validate phone
const validatephone = (phone) => /^[0-9]{10}$/.test(phone);
// Function to validate Username
const validateUsername = (username) => /^[A-Za-z0-9_]{4,20}$/.test(username);
// Function to validate id user
const validateId = (id) => /^[0-9]{1}$/.test(id);

// principal function to authenticated users
exports.crearUsuario = async (req, res) => {
    // get data from user, password, name and rol 
    const { first_name, middle_name, last_name, username, email, phone_number, role, password } = req.body;

    // check the validations

    if(!validateName(first_name) || !validateName(last_name) || (middle_name && !validateName(middle_name))){
        return res.status(400).json({ error: 'Invalid Name.' });
    }
    if(!validateEmail(email)){ return res.status(400).json({ error: 'Invalid Email.' });}
    if(!validateUsername(username)) {return res.status(400).json({ error: 'Invalid Username.' });}
    if(!validatephone(phone_number)) {return res.status(400).json({ error: 'Invalid Phone Number.' });}
    if(!validateId(id)) {return res.status(400).json({ error: 'Invalid Id.' });}
    if (role !== 'admin' && role !== 'seller') return res.status(400).json({ error: 'Invalid role.' }); // -> Verify role

    // Try-catch 
    try {
        // verify if user already exist
        const [user] = await db.query('SELECT * FROM employees WHERE usuario = ?',[usuario]);
        if(user.length > 0)
        {
            return res.status(409).json({ error: 'Already exist'});
        }

        // hash password
        const hashedpassword = await bcrypt.hash(contrasena,10);
        
        // insert data
        await db.query(
            'INSERT INTO employees (first_name, middle_name, last_name, username, email, phone_number, role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, middle_name, last_name, username, email, phone_number, role, hashedPassword]
        );

        return res.status(201).json({ message: 'User created successfully.' });
        
    } catch (error) 
    {
        // mistakes -> error
        console.error(error);
        return res.status(500).json({ error: 'Error registering user' });
    }
};
