const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');
const { checkAuth, checkAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

router.use(checkAuth); // Proteger todas las rutas siguientes

router.post(
  '/signup',
  checkAdmin, // Solo admin puede registrar usuarios
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);

router.get('/', checkAdmin, usersController.getUsers); // Solo admin puede listar usuarios

router.patch('/user/:uid', checkAdmin, usersController.updateUser); // Solo admin puede editar usuarios

router.delete('/user/:uid', checkAdmin, usersController.deleteUser); // Solo admin puede eliminar usuarios

module.exports = router;
