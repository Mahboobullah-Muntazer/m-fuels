const mongoose = require('mongoose');
const lastBillNumberSchema = new mongoose.Schema(
  {
    billNumber: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const LastBillNumber = mongoose.model('LastBillNumber', lastBillNumberSchema);

module.exports = LastBillNumber;
