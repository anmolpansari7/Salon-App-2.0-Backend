const router = require("express").Router();
let PromoCode = require("../models/promocode.model");

router.route("/").get((req, res) => {
  let status = req.query.status;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  if (!startDate) {
    let newDate = new Date();
    const currYear = newDate.getFullYear();
    newDate.setFullYear(currYear - 5);
    startDate = newDate;
  } else {
    startDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);
  }

  if (!endDate) {
    let newDate = new Date();
    const currYear = newDate.getFullYear();
    newDate.setFullYear(currYear + 5);
    endDate = newDate;
  } else {
    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 100);
  }

  let matchObj = {
    $or: [
      { validFrom: { $gte: startDate, $lte: endDate } },
      { validTill: { $gte: startDate, $lte: endDate } },
    ],
  };

  if (status === "active") {
    matchObj = {
      $and: [
        {
          $or: [
            { validFrom: { $gte: startDate, $lte: endDate } },
            { validTill: { $gte: startDate, $lte: endDate } },
          ],
        },
        {
          validTill: { $gt: new Date() },
        },
      ],
    };
  } else if (status === "expired") {
    matchObj = {
      $and: [
        {
          $or: [
            { validFrom: { $gte: startDate, $lte: endDate } },
            { validTill: { $gte: startDate, $lte: endDate } },
          ],
        },
        {
          validTill: { $lt: new Date() },
        },
      ],
    };
  }
  PromoCode.aggregate([
    {
      $match: matchObj,
    },
  ])
    .then((promoCodes) => {
      res.json(promoCodes);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});

router.route("/create").post((req, res) => {
  const newPromoCode = new PromoCode({
    promoCode: req.body.promoCode,
    validFrom: req.body.validFrom,
    validTill: req.body.validTill,
    discountType: req.body.discountType,
    discountValue: req.body.discountValue,
  });

  newPromoCode
    .save()
    .then(() => res.json("PromoCode Saved !"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/active-promocode-list").get((req, res) => {
  let startDate = new Date();
  const currYear = startDate.getFullYear();
  startDate.setFullYear(currYear - 5);

  let endDate = new Date();
  endDate.setFullYear(currYear + 5);

  PromoCode.aggregate([
    {
      $match: {
        $or: [
          { validFrom: { $gte: startDate, $lte: endDate } },
          { validTill: { $gte: startDate, $lte: endDate } },
        ],
      },
    },
  ])
    .then((promodCodes) => {
      res.json(promodCodes);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});

module.exports = router;
