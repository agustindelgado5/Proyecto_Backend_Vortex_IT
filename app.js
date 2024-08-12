const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usersRoutes = require('./routes/user-routes'); 
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// rutas
app.use('/api/users', usersRoutes); //   endpoints bajo /api/users

// middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

// middleware para manejo de errores
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect('mongodb+srv://agustindelgado555:T2PvQo3d7rBPe5Lp@cluster0.3bzvm.mongodb.net/places_test?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    app.listen(5000); 
  })
  .catch(err => {
    console.log(err);
  });
