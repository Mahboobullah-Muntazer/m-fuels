const mongoose = require('mongoose');

// Schema for individual purchases
const purchaseSchema = new mongoose.Schema(
  {
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

// Schema for the parent collection
const purchaseCollectionSchema = new mongoose.Schema(
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
    purchases: [purchaseSchema], // Array of individual purchases
  },
  { timestamps: true }
);

// Model for individual purchases
const Purchase = mongoose.model('Purchase', purchaseSchema);

// Model for the parent collection
const PurchaseCollection = mongoose.model(
  'PurchaseCollection',
  purchaseCollectionSchema
);

module.exports = { Purchase, PurchaseCollection };
