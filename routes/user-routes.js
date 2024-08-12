const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/users-controller');


// Rutas publicas
router.post(
  '/signup',
 
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);






module.exports = router;
