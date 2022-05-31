const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const staffSchema = new Schema(
  {
    gender: { type: String, required: true },
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
      required: true,
    },
    address: String,
    due: Number,
    aadhar: String,
    status: String,
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
