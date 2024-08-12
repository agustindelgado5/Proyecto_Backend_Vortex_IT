const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller'); // Asegúrate de que la ruta es correcta
router.get('/users', usersController.getUsers);

const router = express.Router();

router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup // Aquí es donde debe estar la función definida correctamente
);

module.exports = router;
