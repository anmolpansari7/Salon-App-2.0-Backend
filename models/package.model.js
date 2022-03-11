const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const packageSchema = new Schema(
  {
    gender: String,
    name: { type: String, index: true },
    services: Array,
    totalAmount: Number,
    packageAmount: Number,
    maxUsage: Number,
    validFrom: Date,
    validTill: Date,
    customers: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
