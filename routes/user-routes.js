const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller'); 


const router = express.Router();

router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);


router.get('/users', usersController.getUsers);


module.exports = router;
