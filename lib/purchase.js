const mongoose = require('mongoose');

// Schema for individual purchases
const purchaseSchema = new mongoose.Schema(
  {
    monthYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionsDateManagement',
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    fuelType: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
    },
    quantityInTons: {
      type: Number,
      required: true,
    },
    quantityInLiters: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: String,
      default: Date.now,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    transferedFromAddress: {
      type: String,
      required: true,
    },
  
  },
  { timestamps: true }
);

purchaseSchema.pre('save', function (next) {
  if (this.quantityInLiters !== undefined) {
    this.quantityInLiters = Math.round(this.quantityInLiters * 100) / 100; // Round to 2 decimal places
  }
  if (this.quantityInTons !== undefined) {
    this.quantityInTons = Math.round(this.quantityInTons * 100) / 100; // Round to 2 decimal places
  }
  next();
});


// Adding an index to the monthYear field
purchaseSchema.index({ monthYear: 1 });

// Model for individual purchases
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
