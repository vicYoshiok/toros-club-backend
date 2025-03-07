const { query } = require('../models/userModel');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Generar un código numérico aleatorio de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para registrar un usuario
const registerUser = async (req, res) => {
  const { nombreCompleto, correo, telefono, ocupacion } = req.body;

  // Validar campos
  if (!nombreCompleto || !correo || !telefono || !ocupacion) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // Generar el código de contraseña
  const codigo = generateCode();

  try {
    // Guardar el usuario en la base de datos 
    const sql = `
      INSERT INTO usuarios (nombre_completo, correo, telefono, ocupacion, contrasena)
      VALUES (?, ?, ?, ?, ?)
    `;
    await query(sql, [nombreCompleto, correo, telefono, ocupacion, codigo]);

    // Enviar el código por correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Contraseña de registro | Club Toros de San Nicolás',
      text: `Tu código contraseña es: ${codigo}\n Te Recomendamos memorizarla o guardarla ya que esta es tu acceso a la aplicación y la web del club`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Usuario registrado correctamente. Revisa tu correo para el código de verificación.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
};

//Funcioón para el login de usuario 
const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  // Validar campos
  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Buscar al usuario en la base de datos
    const sql = 'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?';
    const [user] = await query(sql, [correo, contrasena]);

    if (user) {
      res.status(200).json({ message: 'Inicio de sesión exitoso.', user });
    } else {
      res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};

module.exports = { registerUser, loginUser };