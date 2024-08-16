const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usersRoutes = require('./routes/user-routes'); 
const HttpError = require('./models/http-error');
const employeeRoutes = require('./routes/employee-routes');
const positionsRoutes = require('./routes/position-routes');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

// Rutas
app.use('/api/users', usersRoutes); // Registrar endpoints bajo /api/users

// Registrar las rutas para posiciones
app.use('/api/positions', positionsRoutes);

// Registrar las rutas para empleados
app.use('/api/employees', employeeRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  const error = new HttpError('No se pudo encontrar esta ruta.', 404);
  throw error;
});

// Middleware para manejo de errores
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || '¡Ocurrio un error desconocido!' });
});

// Conexión a la base de datos y puesta en marcha del servidor
mongoose
  .connect('mongodb+srv://agustindelgado555:T2PvQo3d7rBPe5Lp@cluster0.3bzvm.mongodb.net/places_test?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Conexión exitosa');
    app.listen(5000); 
  })
  .catch(err => {
    console.log(err);
  });
