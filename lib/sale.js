const mongoose = require('mongoose');
const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
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
    saleDate: {
      type: String,
      default: Date.now,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    pricePerTon: {
      type: Number,
      required: true,
    },

    totalPaid: {
      type: Number,
      required: true,
    },
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const saleCollectionSchema = new mongoose.Schema(
  {
    monthYear: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    sales: [saleSchema], // Array of individual sales
  },
  { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);

// Model for the parent collection
const SaleCollection = mongoose.model('SaleCollection', saleCollectionSchema);

module.exports = { Sale, SaleCollection };
