const mongoose = require('mongoose');
const stockSchema = new mongoose.Schema(
  {
    petrol: {
      quantityInTons: {
        type: Number,
        default: 0,
      },
      quantityInLiters: {
        type: Number,
        default: 0,
      },
    },
    diesel: {
      quantityInTons: {
        type: Number,
        default: 0,
      },
      quantityInLiters: {
        type: Number,
        default: 0,
      },
    },
    gas: {
      quantityInTons: {
        type: Number,
        default: 0,
      },
      quantityInLiters: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
