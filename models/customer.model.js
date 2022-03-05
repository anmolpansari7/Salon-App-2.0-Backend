const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    gender: String,
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    dues: {
      type: Number,
      default: 0,
    },
    package: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
