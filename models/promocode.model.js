const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const promoCodeSchema = new Schema(
  {
    promoCode: String,
    validFrom: { type: Date, index: true },
    validTill: { type: Date, index: true },
    status: { type: String, default: "" },
    discountType: String,
    discountValue: Number,
  },
  {
    timestamps: true,
  }
);

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = PromoCode;
