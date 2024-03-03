const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
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

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
