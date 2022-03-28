const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InventoryItemSchema = new Schema(
  {
    gender: String,
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    distributions: { type: Array, default: [] },
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
  }
);

const InventoryItem = mongoose.model("InventoryItem", InventoryItemSchema);

module.exports = InventoryItem;
