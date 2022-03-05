const mongoose = require("mognoose");

const Schema = mongoose.Schema;

const packageSchema = new Schema(
  {
    gender: String,
    name: String,
    services: Array,
    total: Number,
    packAmount: Number,
    maxNumberUsage: Number,
    validFrom: Date,
    validTill: Date,
    customers: Array,
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
