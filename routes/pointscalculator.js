const router = require("express").Router();
let PointsCalculator = require("../models/points-calculator.model");

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    PointsCalculator.findOne()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.status(400).json("Error : " + err);
      });
  });

router
  .route("/")
  .post(passport.authenticate("jwt", { session: false }), (req, res) => {
    const newpointsCalculator = new PointsCalculator({
      forRupee: req.body.forRupee,
      givenPoints: req.body.givenPoints,
      forPoints: req.body.forPoints,
      givenDiscount: req.body.givenDiscount,
    });

    newpointsCalculator
      .save()
      .then(() => {
        res.json("Item Saved!");
      })
      .catch((err) => {
        res.status(400).json("Error : " + err);
      });
  });

router
  .route("/")
  .patch(passport.authenticate("jwt", { session: false }), (req, res) => {
    PointsCalculator.findOne()
      .then((pointsCalculator) => {
        pointsCalculator.forRupee = req.body.forRupee;
        pointsCalculator.givenPoints = req.body.givenPoints;
        pointsCalculator.forPoints = req.body.forPoints;
        pointsCalculator.givenDiscount = req.body.givenDiscount;

        pointsCalculator
          .save()
          .then(() => {
            res.json("Points Calculator Changed !");
          })
          .catch((err) => {
            res.status(400).json("Error : " + err);
          });
      })
      .catch((err) => {
        res.status(400).json("Error : " + err);
      });
  });

module.exports = router;
