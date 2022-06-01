const router = require("express").Router();
let PromoCode = require("../models/promocode.model");

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
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
      $nor: [
        { validFrom: { $gte: endDate } },
        { validTill: { $lte: startDate } },
      ],
    };

    if (status === "disabled") {
      matchObj["status"] = "disabled";
    } else if (status === "active") {
      matchObj = {
        $nor: [
          { validFrom: { $gte: endDate } },
          { validFrom: { $gte: new Date() } },
          { validTill: { $lte: startDate } },
          { validTill: { $lte: new Date() } },
        ],
      };
      matchObj["status"] = "";
    } else if (status === "expired") {
      matchObj = {
        $nor: [
          { validFrom: { $gt: endDate } },
          { validTill: { $lt: startDate } },
          { validTill: { $gt: new Date() } },
        ],
      };
      matchObj["status"] = "";
    } else if (status === "upcoming") {
      matchObj = {
        $nor: [
          { validFrom: { $gt: endDate } },
          { validTill: { $lt: startDate } },
          { validFrom: { $lte: new Date() } },
        ],
      };
      matchObj["status"] = "";
    }
    PromoCode.aggregate([
      {
        $match: matchObj,
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((promoCodes) => {
        res.json(promoCodes);
      })
      .catch((err) => res.status(400).json("Error :" + err));
  });

// localhost:5000/promocode/:id for status change
router
  .route("/:id")
  .patch(passport.authenticate("jwt", { session: false }), (req, res) => {
    const { id } = req.params;

    PromoCode.findById(id)
      .then((promocode) => {
        promocode.status = req.body.status;

        promocode
          .save()
          .then(() => res.json("Promocode status changed."))
          .catch((err) => res.status(400).json("Err: " + err));
      })
      .catch((err) => res.status(400).json("Error : " + err));
  });

router
  .route("/create")
  .post(passport.authenticate("jwt", { session: false }), async (req, res) => {
    const promo = await PromoCode.findOne({ promoCode: req.body.promoCode });
    if (promo) {
      res.json({
        message: `Promo code "${req.body.promoCode}" already exists.`,
        exists: true,
      });
    } else {
      const newPromoCode = new PromoCode({
        promoCode: req.body.promoCode,
        validFrom: new Date(req.body.validFrom).setHours(0, 0, 0, 0),
        validTill: new Date(req.body.validTill).setHours(23, 59, 59, 99),
        discountType: req.body.discountType,
        discountValue: req.body.discountValue,
      });
      newPromoCode
        .save()
        .then(() => res.json("PromoCode Saved !"))
        .catch((err) => res.status(400).json("Error: " + err));
    }
  });

router
  .route("/active-promocode-list")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    let startDate = new Date();
    const currYear = startDate.getFullYear();
    startDate.setFullYear(currYear - 5);

    let endDate = new Date();
    endDate.setFullYear(currYear + 5);

    PromoCode.aggregate([
      {
        $match: {
          $nor: [
            { validFrom: { $gt: endDate } },
            { validTill: { $lt: startDate } },
            { validTill: { $lt: new Date() } },
            { status: "disabled" },
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
