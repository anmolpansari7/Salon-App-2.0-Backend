const router = require("express").Router();
let PointsCalculator = require("../models/points-calculator.model");

let passport = require("passport");
require("../passport-config")(passport);

router.route("/").get((req, res) => {
  PointsCalculator.findOne()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(400).json("Error : " + err);
    });
});

router.route("/").post((req, res) => {
  const newpointsCalculator = new PointsCalculator({
    forRupeeMale: req.body.forRupeeMale,
    givenPointsMale: req.body.givenPointsMale,
    forPointsMale: req.body.forPointsMale,
    givenDiscountMale: req.body.givenDiscountMale,
    forRupeeFemale: req.body.forRupeeFemale,
    givenPointsFemale: req.body.givenPointsFemale,
    forPointsFemale: req.body.forPointsFemale,
    givenDiscountFemale: req.body.givenDiscountFemale,
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
        (pointsCalculator.forRupeeMale = req.body.forRupeeMale),
          (pointsCalculator.givenPointsMale = req.body.givenPointsMale),
          (pointsCalculator.forPointsMale = req.body.forPointsMale),
          (pointsCalculator.givenDiscountMale = req.body.givenDiscountMale),
          (pointsCalculator.forRupeeFemale = req.body.forRupeeFemale),
          (pointsCalculator.givenPointsFemale = req.body.givenPointsFemale),
          (pointsCalculator.forPointsFemale = req.body.forPointsFemale),
          (pointsCalculator.givenDiscountFemale = req.body.givenDiscountFemale),
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
