const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
  _id: String,
  amountMin: Number,
  amountMax: Number,
  availability: String,
  condition: String,
  currency: String,
  dateSeen: String,
  dateUpdated: Date,
  isSale: String,
  merchant: String,
  shipping: String,
  sourceURLs: String,
  asins: String,
  brand: String,
  categories: String,
  dateAdded: String,
  dateUpdated: String,
  imageURLs: String,
  keys: String,
  manufacturer: String,
  manufacturerNumber: String,
  name: String,
  primaryCategories: String,
  sourceURLs: String,
  upc: String,
  weight: String,
});

module.exports = mongoose.model("SampleData", dataSchema);
