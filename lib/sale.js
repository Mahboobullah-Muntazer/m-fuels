const mongoose = require('mongoose');
const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true, 
    },
    monthYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionsDateManagement',
      required: true,
      index: true, 
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
     
    },
    quantityInLiters: {
      type: Number,
  
    },
    saleDate: {
      type: String,
      default: Date.now,
    },
  
    pricePerTon: {
      type: Number,
      
    },
    pricePerLiter: {
      type: Number,
      
    },

    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);


saleSchema.pre('save', function (next) {
  if (this.quantityInLiters !== undefined) {
    this.quantityInLiters = Math.round(this.quantityInLiters * 100) / 100; // Round to 2 decimal places
  }
  if (this.quantityInTons !== undefined) {
    this.quantityInTons = Math.round(this.quantityInTons * 100) / 100; // Round to 2 decimal places
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
