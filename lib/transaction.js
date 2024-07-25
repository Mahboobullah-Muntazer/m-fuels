const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
 
  monthYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionsDateManagement',
    required: true,
    index: true, 
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true, 
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    index: true, 
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    index: true, 
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    index: true, 
  },
  sarafi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sarafi',
    index: true, 
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'sale','purchase','expense'],
    required: true,
  },
 
  paymentType: {
    type: String,
    enum: ['cash', 'sarafi'],
  },

  personName:{
    type: String,
    
},

  totalAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
  },

  remainingAmount: {
    type: Number,
    default:0,
    required: true,
  },
  receipt: {
    type: String,
   
  },
  description: {
    type: String,
  
  },

  date: {
    type: String,
    default: Date.now,
  },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
