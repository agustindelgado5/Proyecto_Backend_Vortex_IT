const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller'); 
const { checkAuth, checkAdmin } = require('../middleware/check-auth');

const router = express.Router();


router.post('/reset-password', usersController.sendResetToken);

router.patch('/reset-password/:token', [
  check('newPassword').isLength({ min: 6 })
], usersController.resetPassword);


router.get('/login', usersController.login); 


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



router.get('/', checkAdmin, usersController.getUsers); // Solo admin puede listar usuarios

router.patch('/:uid', checkAdmin, usersController.updateUser); // Solo admin puede editar usuarios

router.delete('/:uid', checkAdmin, usersController.deleteUser); // Solo admin puede eliminar usuarios

module.exports = router;
