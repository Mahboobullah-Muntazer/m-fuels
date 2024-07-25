const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema(
  {
    monthYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionsDateManagement',
      required: true,
    },
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

expenseSchema.index({ monthYear: 1 });

const Expense = mongoose.model('Expense', expenseSchema);


module.exports =  Expense
