const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller'); // Importación correcta
const { checkAuth, checkAdmin } = require('../middleware/check-auth');

const router = express.Router();
router.get('/login', usersController.login); // Verifica que 'userController.login' esté correctamente importado y definido

router.use(checkAuth); // Proteger todas las rutas siguientes

router.post(
  '/signup',
  checkAdmin, // Solo admin puede registrar usuarios
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
    check('rol').not().isEmpty()
  ],
  usersController.signup
);

// Enviar el token de recuperación de contraseña
router.post('/reset-password', usersController.sendResetToken); // Corregido `userController` a `usersController`

// Restablecer la contraseña
router.post('/reset-password/:token', [
  check('newPassword').isLength({ min: 6 })
], usersController.resetPassword); // Corregido `userController` a `usersController`


router.get('/', checkAdmin, usersController.getUsers); // Solo admin puede listar usuarios

router.patch('/:uid', checkAdmin, usersController.updateUser); // Solo admin puede editar usuarios

router.delete('/:uid', checkAdmin, usersController.deleteUser); // Solo admin puede eliminar usuarios

module.exports = router;
