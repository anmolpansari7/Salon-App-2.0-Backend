const router = require("express").Router();
let Order = require("../models/order.model");

// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/overview").get(
  //   passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let overview = [];
    let notFound = {
      _id: null,
      totalCustomers: 0,
      totalAmount: 0,
      paidAmount: 0,
      pointsUsed: 0,
      pointsGiven: 0,
      servedBy: "",
    };

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$paidAmount" },
          pointsUsed: { $sum: "$pointsUsed" },
          pointsGiven: { $sum: "$pointsGiven" },
        },
      },
    ])
      .then((todaysOverview) => {
        if (todaysOverview.length !== 0) {
          overview.push(...todaysOverview);
        } else {
          overview.push(notFound);
        }
      })
      .catch((err) => res.status(400).json("Err : " + err));

    today = new Date();
    let day = today.getDay();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() - day);

    await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$paidAmount" },
          pointsUsed: { $sum: "$pointsUsed" },
          pointsGiven: { $sum: "$pointsGiven" },
        },
      },
    ])
      .then((weeksOverview) => {
        if (weeksOverview.length !== 0) {
          overview.push(...weeksOverview);
        } else {
          overview.push(notFound);
        }
      })
      .catch((err) => res.status(400).json("Err : " + err));

    let thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$paidAmount" },
          pointsUsed: { $sum: "$pointsUsed" },
          pointsGiven: { $sum: "$pointsGiven" },
        },
      },
    ])
      .then((monthsOverview) => {
        if (monthsOverview.length !== 0) {
          overview.push(...monthsOverview);
        } else {
          overview.push(notFound);
        }
      })
      .then(() => res.json(overview))
      .catch((err) => res.status(400).json("Err : " + err));
  }
);

router
  .route("/todayCustomers")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $set: { customerId: { $toObjectId: "$customerId" } } },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $project: {
          totalAmount: 1,
          paidAmount: 1,
          paymentMode: 1,
          pointsUsed: 1,
          pointsGiven: 1,
          createdAt: 1,
          customerDetails: {
            name: 1,
            phone: 1,
          },
        },
      },
      {
        $sort: { createdAt: -1, _id: 1 },
      },
    ])
      .then((orders) => res.json(orders))
      .catch((err) => res.status(400).json("Err : " + err));
  });

router
  .route("/thisweekCustomers")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    let today = new Date();
    let day = today.getDay();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() - day);

    Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $set: { customerId: { $toObjectId: "$customerId" } } },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $project: {
          totalAmount: 1,
          paidAmount: 1,
          paymentMode: 1,
          pointsUsed: 1,
          pointsGiven: 1,
          createdAt: 1,
          customerDetails: {
            name: 1,
            phone: 1,
          },
        },
      },
      {
        $sort: { createdAt: -1, _id: 1 },
      },
    ])
      .then((orders) => res.json(orders))
      .catch((err) => res.status(400).json("Err : " + err));
  });

router
  .route("/thismonthCustomers")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    let thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    Order.aggregate([
      { $match: { createdAt: { $gte: thisMonth } } },
      { $set: { customerId: { $toObjectId: "$customerId" } } },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $project: {
          totalAmount: 1,
          paidAmount: 1,
          paymentMode: 1,
          pointsUsed: 1,
          pointsGiven: 1,
          createdAt: 1,
          customerDetails: {
            name: 1,
            phone: 1,
          },
        },
      },
      {
        $sort: { createdAt: -1, _id: 1 },
      },
    ])
      .then((orders) => res.json(orders))
      .catch((err) => res.status(400).json("Err : " + err));
  });

module.exports = router;
