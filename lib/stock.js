const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    fuelType: {
      type: String,
      required: true,
      enum: ['petrol', 'diesel', 'gas'],
    },
    quantityInLiters: {
      type: Number,
      min: 0,
      default: 0
    },
    quantityInTons: {
      type: Number,
      min: 0,
      default: 0
    },
  },
  { timestamps: true }
);

stockSchema.pre('save', function (next) {
  if (this.quantityInLiters !== undefined) {
    this.quantityInLiters = Math.round(this.quantityInLiters * 100) / 100; // Round to 2 decimal places
  }
  if (this.quantityInTons !== undefined) {
    this.quantityInTons = Math.round(this.quantityInTons * 100) / 100; // Round to 2 decimal places
  }
  next();
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;

async function ensureStockExists() {
  const fuelTypes = ['petrol', 'diesel', 'gas'];

  for (const fuelType of fuelTypes) {
    const existingStock = await Stock.findOne({ fuelType });
    if (!existingStock) {
      await Stock.create({ fuelType });
    }
  }
}

// Call this function when needed, for example, during application startup
ensureStockExists().then(() => {
  console.log('Ensured all fuel types have stock entries');
}).catch(err => {
  console.error('Error ensuring stock entries:', err);
});
