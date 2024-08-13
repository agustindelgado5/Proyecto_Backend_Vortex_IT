
const HttpError = require('../models/http-error');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de un nuevo usuario (solo disponible para admin)
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { name, email, password, role } = req.body;

  // Verificar si el usuario que está realizando la solicitud es administrador
  if (req.userData.role !== 'admin') {
    return next(new HttpError('You are not allowed to register users.', 403));
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead.', 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Could not create user, please try again.', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    role: role || 'user', // Establecer el rol, por defecto 'user'
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Creating user failed, please try again.', 500);
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, role: createdUser.role });
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
    return next(new HttpError('Something went wrong, could not delete user.', 500));
  }

  try {
    await user.remove();
  } catch (err) {
    return next(new HttpError('Something went wrong, could not delete user.', 500));
  }

  res.status(200).json({ message: 'User deleted.' });
};

// Iniciar sesión
const login = async (req, res, next) => {
  const { email, password } = req.body;
  
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials, could not log you in.', 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
      'clave_secreta', 
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};





exports.login=login;

exports.getUsers = getUsers;


exports.signup = signup;

exports.updateUser=updateUser;
exports.deleteUser = deleteUser;
