
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: mongoose.Types.ObjectId, required: true, ref: 'Position' },
  salary: { type: Number, required: true },
  dateOfJoining: { type: Date, required: true },
});

module.exports = mongoose.model('Employee', employeeSchema);
