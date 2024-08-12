const HttpError = require('../models/http-error');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { name, email, password } = req.body;

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

  const createdUser = new User({
    name,
    email,
   
    password,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Creating user failed, please try again.', 500);
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password'); 
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later.', 500);
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

exports.getUsers = getUsers;


exports.signup = signup;
