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
    quantity: {
      type: Number,
      required: true,
    },
    lastSoldOn: {
      type: Date,
    },
    lastAddedOn: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

const InventoryItem = mongoose.model("InventoryItem", InventoryItemSchema);

module.exports = InventoryItem;
