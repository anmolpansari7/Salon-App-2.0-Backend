const router = require("express").Router();
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
let Order = require("../models/order.model");
// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/").get(async (req, res) => {
  let branch = req.query.branch;
  let staff = req.query.staff;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let name = req.query.name;
  let queryPattern = new RegExp(name, "gi");
  const customerIds = [];

  let matchObj;
  if (!name) {
    if (!startDate) {
      let newDate = new Date();
      const currYear = newDate.getFullYear();
      newDate.setFullYear(currYear - 1);
      startDate = newDate;
    } else {
      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
    }

    if (!endDate) {
      endDate = new Date();
    } else {
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 100);
    }

    matchObj = {
      createdAt: { $gte: startDate, $lte: endDate },
    };
  } else {
    const customers = await Customer.find({
      $or: [
        { name: { $regex: queryPattern } },
        { contact: { $regex: queryPattern } },
      ],
    });

    if (customers) {
      customers.forEach((data) => {
        customerIds.push(data._id.toString());
      });
      if (customerIds?.length) {
        matchObj = {
          customerId: {
            $in: customerIds,
          },
        };
      }
    }
  }

  if (branch) {
    matchObj["branchId"] = branch;
  }

  if (staff) {
    matchObj["servedBy"] = staff;
  }

  if (!matchObj) {
    res.status(200).json([]);
    return;
  }
  Order.aggregate([
    {
      $match: matchObj,
    },
    { $set: { customerId: { $toObjectId: "$customerId" } } },
    {
      $lookup: {
        from: "customers",
        let: {
          customerId: "$customerId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$customerId"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "customerName",
      },
    },
    { $unwind: "$customerName" },
    { $set: { customerName: "$customerName.name" } },
    { $unset: "customerId" },
    { $set: { branchId: { $toObjectId: "$branchId" } } },
    {
      $lookup: {
        from: "branches",
        let: {
          branchId: "$branchId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$branchId"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "branchName",
      },
    },
    { $unwind: "$branchName" },
    { $set: { branchName: "$branchName.name" } },
    { $unset: "branchId" },
    { $set: { staffId: { $toObjectId: "$servedBy" } } },
    {
      $lookup: {
        from: "staffs",
        let: {
          staffId: "$staffId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$staffId"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "staffName",
      },
    },
    { $unwind: "$staffName" },
    { $set: { staffName: "$staffName.name" } },
    { $unset: "staffId" },
    { $unset: "servedBy" },
    {
      $sort: { createdAt: -1 },
    },
  ])
    .then((order) => {
      console.log("order", order);
      res.json(order);
    })
    .catch((err) => {
      console.error("error:", err);
      res.status(400).json("Error: " + err);
    });
});

router.route("/todays-report-summary").get(async (req, res) => {
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
        pointsEarned: { $sum: "$pointsEarned" },
      },
    },
  ])
    .then((todaysOverview) => {
      if (todaysOverview.length === 0) {
        todaysOverview.push({
          totalCustomers: 0,
          totalAmount: 0,
          paidAmount: 0,
          pointsUsed: 0,
          pointsEarned: 0,
        });
      }
      res.json(todaysOverview[0]);
    })
    .catch((err) => res.status(400).json("Err : " + err));
});

router.route("/report-summary").get(async (req, res) => {
  let branch = req.query.branch;
  let staff = req.query.staff;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let name = req.query.name;
  let queryPattern = new RegExp(name, "gi");

  let matchObj;
  let customerIds = [];
  if (!name) {
    if (!startDate) {
      let newDate = new Date();
      const currYear = newDate.getFullYear();
      newDate.setFullYear(currYear - 1);
      startDate = newDate;
    } else {
      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
    }

    if (!endDate) {
      endDate = new Date();
    } else {
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 100);
    }

    matchObj = {
      createdAt: { $gte: startDate, $lte: endDate },
    };
  } else {
    const customers = await Customer.find({
      $or: [
        { name: { $regex: queryPattern } },
        { contact: { $regex: queryPattern } },
      ],
    });
    if (customers) {
      customers.forEach((data) => {
        customerIds.push(data._id.toString());
      });
      if (customerIds?.length) {
        matchObj = {
          customerId: {
            $in: customerIds,
          },
        };
      }
    }
  }

  if (branch) {
    matchObj["branchId"] = branch;
  }

  if (staff) {
    matchObj["servedBy"] = staff;
  }

  if (!matchObj) {
    const emptyObj = {
      _id: null,
      totalCustomers: 0,
      totalAmount: 0,
      paidAmount: 0,
      pointsUsed: 0,
      pointsEarned: 0,
    };
    res.status(200).json(emptyObj);
    return;
  }
  Order.aggregate([
    { $match: matchObj },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$paidAmount" },
        pointsUsed: { $sum: "$pointsUsed" },
        pointsEarned: { $sum: "$pointsEarned" },
      },
    },
  ])
    .then((summary) => {
      res.json(summary[0]);
    })
    .catch((err) => {
      console.error("Error while fetching report summery:", err);
      res.status(400).json("Err : " + err);
    });
});

router.route("/:query").get((req, res) => {
  const { query } = req.params;

  console.log(query);

  // const queryPattern = new RegExp(query, "gi");

  // Customer.find({
  //   $or: [
  //     { name: { $regex: queryPattern } },
  //     { contact: { $regex: queryPattern } },
  //   ],
  // })
  //   .then((customer) => res.json(customer))
  //   .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
