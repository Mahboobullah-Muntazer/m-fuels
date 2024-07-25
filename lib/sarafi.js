const mongoose = require('mongoose');
const sarafiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    }, 
    
  },
  { timestamps: true }
);

const Sarafi = mongoose.model('Sarafi', sarafiSchema);

module.exports = Sarafi;
