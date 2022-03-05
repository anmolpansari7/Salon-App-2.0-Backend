const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OwnerSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Owner = mongoose.model("Owner", OwnerSchema);

module.exports = Owner;
