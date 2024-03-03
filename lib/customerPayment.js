const mongoose = require('mongoose');

const customerPaymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    sales: [
      {
        sale: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Sale',
        },
      },
    ],
    payments: [
      {
        amount: {
          type: Number,
          required: true,
        },
        paymentDate: {
          type: Date,
          required: true,
        },
        type: {
          type: String,
          enum: ['debit', 'credit'],
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        billNumber: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const CustomerPayment = mongoose.model(
  'CustomerPayment',
  customerPaymentSchema
);

module.exports = CustomerPayment;
