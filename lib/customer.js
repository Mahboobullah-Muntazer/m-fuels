const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      index: true, 
    },

    contactNumber: {
      type: String,
      index: true, 
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      required:true,
      enum: ['partner', 'normal'],
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
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
