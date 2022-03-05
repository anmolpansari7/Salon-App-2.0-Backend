const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const branchSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
  }
);

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
