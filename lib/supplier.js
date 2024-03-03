const mongoose = require('mongoose');
const supplierSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
    },
    authorizedPerson: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
