const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    salaryDate: {
      type: String,
      required: true,
    },
    salaryMonth: {
      type: String,
      required: true,
    },
    salaryYear: {
      type: String,
      required: true,
    },
    salaryAmount: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const salaryCollectionSchema = new mongoose.Schema(
  {
    monthYear: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    salaries: [salarySchema], // Array of individual purchases
  },
  { timestamps: true }
);

const Salary = mongoose.model('Salary', salarySchema);

const SalaryCollection = mongoose.model(
  'SalaryCollection',
  salaryCollectionSchema
);

module.exports = { Salary, SalaryCollection };
