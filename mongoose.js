const mongoose = require('mongoose');


const User = require('./models/user');


mongoose.connect('mongodb+srv://agustindelgado555:T2PvQo3d7rBPe5Lp@cluster0.3bzvm.mongodb.net/places_test?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Connection failed');
  });

// Crear un nuevo usuario (solo disponible para admin)
const createUser = async (req, res, next) => {
  const createdUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
   
  });
  
  try {
    const result = await createdUser.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Creating user failed' });
  }
};

// Obtener todos los usuarios (solo disponible para admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().exec();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Fetching users failed' });
  }
};


module.exports = {
  createUser,
  getUsers,
  
};
