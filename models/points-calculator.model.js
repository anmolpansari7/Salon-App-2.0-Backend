const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pointsCalculatorSchema = new Schema(
  {
    forRupee: Number,
    givenPoints: Number,
    forPoints: Number,
    givenDiscount: Number,
  },
  {
    timestamps: true,
  }
);

const PointsCalculator = mongoose.model(
  "PointsCalculator",
  pointsCalculatorSchema
);

module.exports = PointsCalculator;
