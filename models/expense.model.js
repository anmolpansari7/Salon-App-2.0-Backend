const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const expenseSchema = new Schema(
  {
    branch: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    remark: { type: String },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
