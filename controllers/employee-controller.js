
const HttpError = require('../models/http-error');
const Employee = require('../models/employee');
const Position = require('../models/position');
//filtrar  listado de empleados
const getEmployees = async (req, res, next) => {
  const { name, email, positionId } = req.query;

  let filter = {};
  if (name) filter.name = new RegExp(name, 'i');
  if (email) filter.email = new RegExp(email, 'i');
  if (positionId) filter.position = positionId;

  let employees;
  try {
    employees = await Employee.find(filter).populate('position');
  } catch (err) {
    return next(new HttpError('Fetching employees failed, please try again later.', 500));
  }

  res.json({ employees: employees.map(emp => emp.toObject({ getters: true })) });
};

const getEmployeeById = async (req, res, next) => {
  const employeeId = req.params.id;

  let employee;
  try {
    employee = await Employee.findById(employeeId).populate('position');
  } catch (err) {
    return next(new HttpError('Fetching employee failed, please try again later.', 500));
  }

  if (!employee) {
    return next(new HttpError('Employee not found.', 404));
  }

  res.json({ employee: employee.toObject({ getters: true }) });
};

const createEmployee = async (req, res, next) => {
  const { name, email, position, salary, dateOfJoining } = req.body;

  let existingPosition;
  try {
    existingPosition = await Position.findById(position);
  } catch (err) {
    return next(new HttpError('Could not find position, please try again.', 500));
  }

  if (!existingPosition) {
    return next(new HttpError('Position not found.', 404));
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
    return next(new HttpError('Creating employee failed, please try again.', 500));
  }

  res.status(201).json({ employee: createdEmployee.toObject({ getters: true }) });
};

const updateEmployee = async (req, res, next) => {
  const { name, email, position, salary, dateOfJoining } = req.body;
  const employeeId = req.params.id;

  let employee;
  try {
    employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(new HttpError('Employee not found.', 404));
    }
  } catch (err) {
    return next(new HttpError('Could not update employee, please try again.', 500));
  }

  employee.name = name;
  employee.email = email;
  employee.position = position;
  employee.salary = salary;
  employee.dateOfJoining = dateOfJoining;

  try {
    await employee.save();
  } catch (err) {
    return next(new HttpError('Could not update employee, please try again.', 500));
  }

  res.status(200).json({ employee: employee.toObject({ getters: true }) });
};

const deleteEmployee = async (req, res, next) => {
  const employeeId = req.params.id;

  let employee;
  try {
    employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(new HttpError('Employee not found.', 404));
    }
  } catch (err) {
    return next(new HttpError('Could not delete employee, please try again.', 500));
  }

  try {
    await employee.remove();
  } catch (err) {
    return next(new HttpError('Could not delete employee, please try again.', 500));
  }

  res.status(200).json({ message: 'Employee deleted.' });
};

exports.getEmployees = getEmployees;
exports.getEmployeeById = getEmployeeById;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
