const HttpError = require('../models/http-error');
const Employee = require('../models/employee');
const Position = require('../models/position');

// Filtrar listado de empleados
const getEmployees = async (req, res, next) => {
  const {name, email, positionId } = req.query;

  let filter = {};
  if (name) filter.name = new RegExp(name, 'i');
  if (email) filter.email = new RegExp(email, 'i');
  if (positionId) filter.position = positionId;

  let employees;
  try {
    employees = await Employee.find(filter).populate('position');
  } catch (err) {
    return next(new HttpError('Fallo al obtener los empleados, por favor intenta nuevamente más tarde.', 500));
  }

  res.json({ employees: employees.map(emp => emp.toObject({ getters: true })) });
};

// Obtener empleado por ID
const getEmployeeById = async (req, res, next) => {
  const employeeId = req.params.id;

  let employee;
  try {
    employee = await Employee.findById(employeeId).populate('position');
  } catch (err) {
    return next(new HttpError('Fallo al obtener el empleado, por favor intenta nuevamente más tarde.', 500));
  }

  if (!employee) {
    return next(new HttpError('Empleado no encontrado.', 404));
  }

  res.json({ employee: employee.toObject({ getters: true }) });
};

// Crear un nuevo empleado
const createEmployee = async (req, res, next) => {
  const { name, email, position, salary, dateOfJoining } = req.body;

  let existingPosition;
  try {
    existingPosition = await Position.findById(position);
  } catch (err) {
    return next(new HttpError('No se pudo encontrar la posición, por favor intenta nuevamente.', 500));
  }

  if (!existingPosition) {
    return next(new HttpError('Posición no encontrada.', 404));
  }

  const createdEmployee = new Employee({
    name,
    email,
    position,
    salary,
    dateOfJoining,
  });

  try {
    await createdEmployee.save();
  } catch (err) {
    return next(new HttpError('Fallo al crear el empleado, por favor intenta nuevamente.', 500));
  }

  res.status(201).json({ employee: createdEmployee.toObject({ getters: true }) });
};

// Actualizar un empleado existente
const updateEmployee = async (req, res, next) => {
  const { name, email, position, salary, dateOfJoining } = req.body;
  const employeeId = req.params.id;

  let employee;
  try {
    employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(new HttpError('Empleado no encontrado.', 404));
    }
  } catch (err) {
    return next(new HttpError('No se pudo actualizar el empleado, por favor intenta nuevamente.', 500));
  }

  employee.name = name;
  employee.email = email;
  employee.position = position;
  employee.salary = salary;
  employee.dateOfJoining = dateOfJoining;

  try {
    await employee.save();
  } catch (err) {
    return next(new HttpError('No se pudo actualizar el empleado, por favor intenta nuevamente.', 500));
  }

  res.status(200).json({ employee: employee.toObject({ getters: true }) });
};

// Eliminar un empleado
const deleteEmployee = async (req, res, next) => {
  const employeeId = req.params.id;

  let employee;
  try {
    employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(new HttpError('Empleado no encontrado.', 404));
    }
  } catch (err) {
    return next(new HttpError('No se pudo eliminar el empleado, por favor intenta nuevamente.', 500));
  }

  try {
    await employee.remove();
  } catch (err) {
    return next(new HttpError('No se pudo eliminar el empleado, por favor intenta nuevamente.', 500));
  }

  res.status(200).json({ message: 'Empleado eliminado.' });
};

exports.getEmployees = getEmployees;
exports.getEmployeeById = getEmployeeById;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
