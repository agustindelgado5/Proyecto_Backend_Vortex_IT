const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

const checkAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    console.log('token',req.headers)

    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    
    if (!token) {
      throw new Error('Authentication failed!');
    }

    const decodedToken = jwt.verify(token,'secret');
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };

    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};

const checkAdmin = (req, res, next) => {
  if (req.userData.role !== 'admin') {
    const error = new HttpError('Access denied, admin only', 403);
    return next(error);
  }
  next();
};

module.exports = { checkAuth, checkAdmin };
