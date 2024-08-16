const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

// Middleware para verificar la autenticacion del usuario
const checkAuth = (req, res, next) => {
  // Permitir solicitudes de tipo OPTIONS sin verificacion de token
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    // obtengo el token de autorizacion del encabezado de la solicitud
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    
    // Si no hay token, lanzar un error de autenticación
    if (!token) {
      throw new Error('Authentication failed!');
    }

    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, 'secret');
    // Agregar los datos del usuario al objeto de la solicitud
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };

    // paso al siguiente middleware
    next();
  } catch (err) {
    // Si ocurre un error, lanzar un error de autenticación
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};

// Middleware para verificar si el usuario es administrador
const checkAdmin = (req, res, next) => {
  // Si el rol del usuario no es 'admin', denegar acceso
  if (req.userData.role !== 'admin') {
    const error = new HttpError('Access denied, admin only', 403);
    return next(error);
  }
  // Si es admin, pasar al siguiente middleware
  next();
};

module.exports = { checkAuth, checkAdmin };
