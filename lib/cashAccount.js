const mongoose = require('mongoose');

const cashAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Main',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const CashAccount = mongoose.model('CashAccount', cashAccountSchema);

module.exports = CashAccount;
