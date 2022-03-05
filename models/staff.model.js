const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const staffSchema = new Schema(
  {
    gender: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    due: { type: Number, required: true },
    aadhar: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
