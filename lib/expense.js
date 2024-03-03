const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema(
  {
    personName: {
      type: String,
      required: true,
    },

    expenseDate: {
      type: String,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const expenseCollectionSchema = new mongoose.Schema(
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
    expenses: [expenseSchema], // Array of individual purchases
  },
  { timestamps: true }
);
const Expense = mongoose.model('Expense', expenseSchema);

const ExpenseCollection = mongoose.model(
  'ExpenseCollection',
  expenseCollectionSchema
);

module.exports = { Expense, ExpenseCollection };
