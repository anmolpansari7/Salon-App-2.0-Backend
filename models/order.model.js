const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    type: { type: String, required: true },
    customerId: { type: String, required: true },
    serviceIds: Array,
    inventoryItemIds: Array,
    totalAmount: Number,
    paidAmount: Number,
    paymentMode: { type: String, required: true },
    remark: String,
    pointsUsed: Number,
    pointsEarned: Number,
    discountGiven: Number,
    promoCode: String,
    servedBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
