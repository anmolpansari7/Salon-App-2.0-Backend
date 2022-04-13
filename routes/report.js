const router = require("express").Router();
let Order = require("../models/order.model");

// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/").get((req, res) => {
  let branch = req.query.branch;
  let staff = req.query.staff;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let name = req.query.name;
  let queryPattern = new RegExp(name, "gi");

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
  }
  // else {
  //   matchObj = {
  //     $or: [
  //       { name: { $regex: queryPattern } },
  //       { contact: { $regex: queryPattern } },
  //     ],
  //   };
  // }

  if (branch) {
    matchObj["branchId"] = branch;
  }

  if (staff) {
    matchObj["servedBy"] = staff;
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
  ])
    .then((order) => res.json(order))
    .catch((err) => res.status(400).json("Error: " + err));
});

// router.route("/overview").get(
//   //   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     let overview = [];
//     let notFound = {
//       _id: null,
//       totalCustomers: 0,
//       totalAmount: 0,
//       paidAmount: 0,
//       pointsUsed: 0,
//       pointsGiven: 0,
//       servedBy: "",
//     };

//     let today = new Date();
//     today.setHours(0, 0, 0, 0);

//     await Order.aggregate([
//       { $match: { createdAt: { $gte: today } } },
//       {
//         $group: {
//           _id: null,
//           totalCustomers: { $sum: 1 },
//           totalAmount: { $sum: "$totalAmount" },
//           paidAmount: { $sum: "$paidAmount" },
//           pointsUsed: { $sum: "$pointsUsed" },
//           pointsGiven: { $sum: "$pointsGiven" },
//         },
//       },
//     ])
//       .then((todaysOverview) => {
//         if (todaysOverview.length !== 0) {
//           overview.push(...todaysOverview);
//         } else {
//           overview.push(notFound);
//         }
//       })
//       .catch((err) => res.status(400).json("Err : " + err));

//     today = new Date();
//     let day = today.getDay();
//     today.setHours(0, 0, 0, 0);
//     today.setDate(today.getDate() - day);

//     await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: today },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalCustomers: { $sum: 1 },
//           totalAmount: { $sum: "$totalAmount" },
//           paidAmount: { $sum: "$paidAmount" },
//           pointsUsed: { $sum: "$pointsUsed" },
//           pointsGiven: { $sum: "$pointsGiven" },
//         },
//       },
//     ])
//       .then((weeksOverview) => {
//         if (weeksOverview.length !== 0) {
//           overview.push(...weeksOverview);
//         } else {
//           overview.push(notFound);
//         }
//       })
//       .catch((err) => res.status(400).json("Err : " + err));

//     let thisMonth = new Date();
//     thisMonth.setDate(1);
//     thisMonth.setHours(0, 0, 0, 0);

//     await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: thisMonth },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalCustomers: { $sum: 1 },
//           totalAmount: { $sum: "$totalAmount" },
//           paidAmount: { $sum: "$paidAmount" },
//           pointsUsed: { $sum: "$pointsUsed" },
//           pointsGiven: { $sum: "$pointsGiven" },
//         },
//       },
//     ])
//       .then((monthsOverview) => {
//         if (monthsOverview.length !== 0) {
//           overview.push(...monthsOverview);
//         } else {
//           overview.push(notFound);
//         }
//       })
//       .then(() => res.json(overview))
//       .catch((err) => res.status(400).json("Err : " + err));
//   }
// );

// router
//   .route("/todayCustomers")
//   .get(passport.authenticate("jwt", { session: false }), (req, res) => {
//     let today = new Date();
//     today.setHours(0, 0, 0, 0);

//     Order.aggregate([
//       { $match: { createdAt: { $gte: today } } },
//       { $set: { customerId: { $toObjectId: "$customerId" } } },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $project: {
//           totalAmount: 1,
//           paidAmount: 1,
//           paymentMode: 1,
//           pointsUsed: 1,
//           pointsGiven: 1,
//           createdAt: 1,
//           customerDetails: {
//             name: 1,
//             phone: 1,
//           },
//         },
//       },
//       {
//         $sort: { createdAt: -1, _id: 1 },
//       },
//     ])
//       .then((orders) => res.json(orders))
//       .catch((err) => res.status(400).json("Err : " + err));
//   });

// router
//   .route("/thisweekCustomers")
//   .get(passport.authenticate("jwt", { session: false }), (req, res) => {
//     let today = new Date();
//     let day = today.getDay();
//     today.setHours(0, 0, 0, 0);
//     today.setDate(today.getDate() - day);

//     Order.aggregate([
//       { $match: { createdAt: { $gte: today } } },
//       { $set: { customerId: { $toObjectId: "$customerId" } } },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $project: {
//           totalAmount: 1,
//           paidAmount: 1,
//           paymentMode: 1,
//           pointsUsed: 1,
//           pointsGiven: 1,
//           createdAt: 1,
//           customerDetails: {
//             name: 1,
//             phone: 1,
//           },
//         },
//       },
//       {
//         $sort: { createdAt: -1, _id: 1 },
//       },
//     ])
//       .then((orders) => res.json(orders))
//       .catch((err) => res.status(400).json("Err : " + err));
//   });

// router
//   .route("/thismonthCustomers")
//   .get(passport.authenticate("jwt", { session: false }), (req, res) => {
//     let thisMonth = new Date();
//     thisMonth.setDate(1);
//     thisMonth.setHours(0, 0, 0, 0);

//     Order.aggregate([
//       { $match: { createdAt: { $gte: thisMonth } } },
//       { $set: { customerId: { $toObjectId: "$customerId" } } },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: "$customerDetails",
//       },
//       {
//         $project: {
//           totalAmount: 1,
//           paidAmount: 1,
//           paymentMode: 1,
//           pointsUsed: 1,
//           pointsGiven: 1,
//           createdAt: 1,
//           customerDetails: {
//             name: 1,
//             phone: 1,
//           },
//         },
//       },
//       {
//         $sort: { createdAt: -1, _id: 1 },
//       },
//     ])
//       .then((orders) => res.json(orders))
//       .catch((err) => res.status(400).json("Err : " + err));
//   });

module.exports = router;
