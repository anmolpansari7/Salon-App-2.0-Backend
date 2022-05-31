const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pointsCalculatorSchema = new Schema(
  {
    forRupeeMale: Number,
    givenPointsMale: Number,
    forPointsMale: Number,
    givenDiscountMale: Number,
    forRupeeFemale: Number,
    givenPointsFemale: Number,
    forPointsFemale: Number,
    givenDiscountFemale: Number,
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
