const HttpError = require('../models/http-error');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto'); // Para generar tokens únicos
const nodemailer = require('nodemailer'); // Para enviar emails


// Registro de un nuevo usuario (solo disponible para admin)
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Datos inválidos, por favor revisa tu información.', 422));
  }

  const { name, email, password, role } = req.body;

  // Verificar si el usuario que está realizando la solicitud es administrador
  if (req.userData.role !== 'admin') {
    return next(new HttpError('No tienes permiso para registrar usuarios.', 403));
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError('El registro falló, por favor intenta nuevamente más tarde.', 500));
  }

  if (existingUser) {
    return next(new HttpError('El usuario ya existe, por favor inicia sesión.', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('No se pudo crear el usuario, por favor intenta nuevamente.', 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('El registro falló, por favor intenta nuevamente.', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email, role: createdUser.role },
      'secret',
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('El registro falló, por favor intenta nuevamente.', 500));
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// Listar todos los usuarios (solo disponible para admin)
const getUsers = async (req, res, next) => {
  // Verificar si el usuario que está realizando la solicitud es administrador
  if (req.userData.role !== 'admin') {
    return next(new HttpError('You are not allowed to view users.', 403));
  }

  let users;
  try {
    users = await User.find({}, '-password'); // Excluir el campo de la contraseña
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later.', 500);
    return next(error);
  }
  
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

// Actualizar un usuario (solo disponible para admin)
const updateUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const userId = req.params.uid;

  // Verificar si el usuario que está realizando la solicitud es administrador
  if (req.userData.role !== 'admin') {
    return next(new HttpError('You are not allowed to edit users.', 403));
  }

  let user;
  try {
    console.log(userId)
    user = await User.findById(userId);
    
    if (!user) {
      return next(new HttpError('User not found.', 404));
    }
  } catch (err) {
    return next(new HttpError('Something went wrong, could not update user.', 500));
  }

  user.name = name;
  user.email = email;

  if (password) {
    try {
      user.password = await bcrypt.hash(password, 12);
    } catch (err) {
      return next(new HttpError('Something went wrong, could not update password.', 500));
    }
  }

  user.role = role || user.role; // Actualizar el rol solo si se proporciona uno nuevo

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError('Something went wrong, could not update user.', 500));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

// Eliminar un usuario (solo disponible para admin)
const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  // Verificar si el usuario que está realizando la solicitud es administrador
  if (req.userData.role !== 'admin') {
    return next(new HttpError('You are not allowed to delete users.', 403));
  }

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('User not found.', 404));
    }
  } catch (err) {
    console.error('Error finding user:', err); // Añadir este log para más detalles
    return next(new HttpError('Something went wrong, could not delete user.', 500));
  }

  try {
    await user.deleteOne({ _id: userId });
  } catch (err) {
    console.error('Error finding user:', err); // Añadir este log para más detalles
    return next(new HttpError('Something went wrong, could not delete user.', 500));
  }

  res.status(200).json({ message: 'User deleted.' });
};




// Login de un usuario
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError('No se pudo iniciar sesión, por favor intenta nuevamente más tarde.', 500));
  }

  if (!existingUser) {
    return next(new HttpError('Credenciales incorrectas, no se pudo iniciar sesión.', 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError('No se pudo iniciar sesión, por favor intenta nuevamente.', 500));
  }

  if (!isValidPassword) {
    return next(new HttpError('Credenciales incorrectas, no se pudo iniciar sesión.', 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
      'secret',
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('No se pudo iniciar sesión, por favor intenta nuevamente.', 500));
  }

  res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};
/*
// Middleware de autenticación
const checkAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  let token;
  try {
    token = req.headers.authorization.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      throw new Error('Autenticación fallida.');
    }
    const decodedToken = jwt.verify(token, 'secret');
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next();
  } catch (err) {
    return next(new HttpError('Autenticación fallida.', 403));
  }
};
*/
// Generar y enviar el token de recuperación de contraseña
const sendResetToken = async (req, res, next) => {
  const { email } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError('No se encontró un usuario con ese correo electrónico.', 404));
    }
  } catch (err) {
    return next(new HttpError('Algo salió mal, por favor intenta nuevamente más tarde.', 500));
  }

  // Generar token de recuperación
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.tokenExpiration = Date.now() + 3600000; // 1 hora de validez

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError('Algo salió mal, por favor intenta nuevamente más tarde.', 500));
  }

  // Configurar y enviar el correo electrónico
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperación de Contraseña',
    html: `<p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
           <p><a href="${process.env.FRONTEND_URL}/reset-password/${token}">Restablecer Contraseña</a></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo de recuperación enviado.' });
  } catch (err) {
    return next(new HttpError('No se pudo enviar el correo de recuperación, por favor intenta nuevamente más tarde.', 500));
  }
};

// Actualizar la contraseña usando el token de recuperación
const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  let user;
  try {
    user = await User.findOne({ resetToken: token, tokenExpiration: { $gt: Date.now() } });
    if (!user) {
      return next(new HttpError('Token de recuperación inválido o expirado.', 400));
    }
  } catch (err) {
    return next(new HttpError('Algo salió mal, por favor intenta nuevamente más tarde.', 500));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    return next(new HttpError('No se pudo actualizar la contraseña, por favor intenta nuevamente.', 500));
  }

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.tokenExpiration = undefined;

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError('No se pudo actualizar la contraseña, por favor intenta nuevamente.', 500));
  }

  res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
};



module.exports = {
  signup,
  getUsers,
  updateUser,
  deleteUser,
  login,
  //checkAuth,
  sendResetToken,  //  función para enviar el token de recuperación de contraseña
  resetPassword,   // función para restablecer la contraseña
};
