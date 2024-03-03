const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    NIC: {
      type: String,
      unique: true,
    },
    contactNumber: {
      type: String,
    },
    position: {
      type: String,
      required: true,
    },
    joinDate: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
    },
    address: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
