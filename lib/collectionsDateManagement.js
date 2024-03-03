const mongoose = require('mongoose');
const collectionsDateManagementSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const CollectionsDateManagement = mongoose.model(
  'CollectionsDateManagement',
  collectionsDateManagementSchema
);

module.exports = CollectionsDateManagement;
