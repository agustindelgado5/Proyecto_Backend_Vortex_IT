const express = require('express');
const { check } = require('express-validator');
const employeeController = require('../controllers/employee-controller');

const router = express.Router();

router.get('/', employeeController.getEmployees);

router.get('/:eid', employeeController.getEmployeeById);

router.post(
  '/',
  [
    check('name').not().isEmpty(),
    check('position').not().isEmpty(),
    check('salary').isNumeric()
  ],
  employeeController.createEmployee
);

router.patch('/:eid', employeeController.updateEmployee);

router.delete('/:eid', employeeController.deleteEmployee);

module.exports = router;
