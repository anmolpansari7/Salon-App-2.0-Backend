const router = require("express").Router();
const { default: mongoose } = require("mongoose");
let Customer = require("../models/customer.model");
let ServiceSchema = require("../models/service.model");
let Order = require("../models/order.model");

// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/").get((req, res) => {
  let type = req.query.type;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let name = req.query.name;
  let queryPattern = new RegExp(name, "gi");

  let matchObj;
  if (!name) {
    if (!startDate) {
      let newDate = new Date();
      const currYear = newDate.getFullYear();
      newDate.setFullYear(currYear - 20);
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

    if (type === "visited") {
      matchObj = {
        updatedAt: { $gte: startDate, $lte: endDate },
      };
    } else if (type === "non-visited") {
      matchObj = {
        $nor: [{ updatedAt: { $gte: startDate, $lte: endDate } }],
      };
    }
  } else {
    matchObj = {
      $or: [
        { name: { $regex: queryPattern } },
        { contact: { $regex: queryPattern } },
      ],
    };
  }

  Customer.aggregate([
    {
      $match: matchObj,
    },
    {
      $sort: { updatedAt: -1 },
    },
  ])
    .then((customer) => res.json(customer))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/todays-birthday").get((req, res) => {
  Customer.find({
    $expr: {
      $and: [
        { $eq: [{ $dayOfMonth: "$dob" }, { $dayOfMonth: new Date() }] },
        { $eq: [{ $month: "$dob" }, { $month: new Date() }] },
      ],
    },
  })
    .then((customer) => res.json(customer))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:query").get(
  //   passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { query } = req.params;
    const queryPattern = new RegExp(query, "gi");

    Customer.find({
      $or: [
        { name: { $regex: queryPattern } },
        { contact: { $regex: queryPattern } },
      ],
    })
      .then((customer) => res.json(customer))
      .catch((err) => res.status(400).json("Error: " + err));
  }
);

router.route("/details/:id").get(
  //   passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id } = req.params;

    Customer.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(id) },
      },
      {
        $unwind: {
          path: "$package",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $set: { packageId: { $toObjectId: "$package.packageId" } } },
      {
        $lookup: {
          from: "packages",
          let: {
            packageId: "$packageId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$packageId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
                packageAmount: 1,
                totalAmount: 1,
                services: 1,
              },
            },
          ],
          as: "packageName",
        },
      },
      {
        $unwind: {
          path: "$packageName",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $set: { "package.packageName": "$packageName.name" } },
      { $set: { "package.packageAmount": "$packageName.packageAmount" } },
      { $set: { "package.totalAmount": "$packageName.totalAmount" } },
      { $set: { "package.services": "$packageName.services" } },
      { $unset: "packageName" },
      { $unset: "packageId" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          gender: { $first: "$gender" },
          dob: { $first: "$dob" },
          dues: { $first: "$dues" },
          contact: { $first: "$contact" },
          createdAt: { $first: "$createdAt" },
          address: { $first: "$address" },
          package: { $push: "$package" },
          points: { $first: "$points" },
        },
      },
    ])
      .then(async (customer) => {
        await Promise.all(
          customer[0].package.map(async (pack) => {
            let currentPackServices = [];
            if (pack.services !== undefined) {
              await Promise.all(
                pack.services.map(async (service) => {
                  const item = await ServiceSchema.findById(service);
                  currentPackServices.push(item.name);
                })
              );
              pack.serviceNames = currentPackServices;
            }
          })
        );
        res.json(customer[0]);
      })
      .catch((err) => res.status(400).json("Error : " + err));
  }
);

router.route("/details/:id/orders").get((req, res) => {
  const { id } = req.params;
  let staff = req.query.staff;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  if (!startDate) {
    let newDate = new Date();
    const currYear = newDate.getFullYear();
    newDate.setFullYear(currYear - 20);
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

  const matchObj = {
    createdAt: { $gte: startDate, $lte: endDate },
  };

  if (staff) {
    matchObj["servedBy"] = staff;
  }

  matchObj["customerId"] = id;

  Order.aggregate([
    {
      $match: matchObj,
    },
    {
      $unwind: {
        path: "$serviceIds",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $set: { serviceId: { $toObjectId: "$serviceIds" } } },
    { $unset: "serviceIds" },
    {
      $lookup: {
        from: "services",
        let: {
          serviceId: "$serviceId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$serviceId"],
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
        as: "serviceName",
      },
    },
    {
      $unwind: {
        path: "$serviceName",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: "serviceId",
    },
    { $set: { serviceName: "$serviceName.name" } },
    {
      $group: {
        _id: "$_id",
        type: { $first: "$type" },
        serviceName: { $push: "$serviceName" },
        inventoryItemIds: { $first: "$inventoryItemIds" },
        packageId: { $first: "$packageId" },
        totalAmount: { $first: "$totalAmount" },
        discountGiven: { $first: "$discountGiven" },
        paidAmount: { $first: "$paidAmount" },
        paymentMode: { $first: "$paymentMode" },
        promoCode: { $first: "$promoCode" },
        pointsUsed: { $first: "$pointsUsed" },
        pointsEarned: { $first: "$pointsEarned" },
        remark: { $first: "$remark" },
        servedBy: { $first: "$servedBy" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$_id",
        type: { $first: "$type" },
        serviceName: { $push: "$serviceName" },
        inventoryItemIds: { $first: "$inventoryItemIds" },
        packageId: { $first: "$packageId" },
        totalAmount: { $first: "$totalAmount" },
        discountGiven: { $first: "$discountGiven" },
        paidAmount: { $first: "$paidAmount" },
        paymentMode: { $first: "$paymentMode" },
        promoCode: { $first: "$promoCode" },
        pointsUsed: { $first: "$pointsUsed" },
        pointsEarned: { $first: "$pointsEarned" },
        remark: { $first: "$remark" },
        servedBy: { $first: "$servedBy" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $unwind: {
        path: "$inventoryItemIds",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $set: { inventoryItemId: { $toObjectId: "$inventoryItemIds" } } },
    { $unset: "inventoryItemIds" },
    {
      $lookup: {
        from: "inventoryitems",
        let: {
          inventoryItemId: "$inventoryItemId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$inventoryItemId"],
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
        as: "inventoryItemName",
      },
    },
    {
      $unwind: {
        path: "$inventoryItemName",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: "inventoryItemId",
    },
    { $set: { inventoryItemName: "$inventoryItemName.name" } },
    {
      $group: {
        _id: "$_id",
        type: { $first: "$type" },
        serviceName: { $first: "$serviceName" },
        inventoryItemName: { $push: "$inventoryItemName" },
        packageId: { $first: "$packageId" },
        totalAmount: { $first: "$totalAmount" },
        discountGiven: { $first: "$discountGiven" },
        paidAmount: { $first: "$paidAmount" },
        paymentMode: { $first: "$paymentMode" },
        promoCode: { $first: "$promoCode" },
        pointsUsed: { $first: "$pointsUsed" },
        pointsEarned: { $first: "$pointsEarned" },
        remark: { $first: "$remark" },
        servedBy: { $first: "$servedBy" },
        createdAt: { $first: "$createdAt" },
      },
    },
    { $set: { servedById: { $toObjectId: "$servedBy" } } },
    {
      $lookup: {
        from: "staffs",
        let: {
          staffId: "$servedById",
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
        as: "staffMemberName",
      },
    },
    {
      $unwind: {
        path: "$staffMemberName",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: "servedById",
    },
    { $set: { servedBy: "$staffMemberName.name" } },
    { $unset: "staffMemberName" },
    ///,
    {
      $set: {
        packageId: {
          $cond: {
            if: { $eq: ["$packageId", ""] },
            then: new mongoose.Types.ObjectId(),
            else: { $toObjectId: "$packageId" },
          },
        },
      },
    },
    {
      $lookup: {
        from: "packages",
        let: {
          packageId: "$packageId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$packageId"],
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
        as: "packageName",
      },
    },
    {
      $unwind: {
        path: "$packageName",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: "packageId",
    },
    { $set: { packageName: "$packageName.name" } },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ])
    .then((order) => {
      res.json(order);
    })
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/add").post(
  //   passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const gender = req.body.gender;
    const name = req.body.name;
    const contact = req.body.contact;
    const points = 0;
    const dues = 0;
    const dob = Date.parse(req.body.dob);
    const address = req.body.address;
    const package = [];

    const newCustomer = new Customer({
      gender,
      name,
      contact,
      points,
      dues,
      dob,
      address,
      package,
    });

    newCustomer
      .save()
      .then(() => res.json(newCustomer._id))
      .catch((err) => res.status(400).json("Error: " + err));
  }
);

// Update Dues and Points

router.route("/update-dues-points/:id").patch(
  //   passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { id } = req.params;
    const dues = Number(req.body.dues);
    const points = Number(req.body.points);

    Customer.findByIdAndUpdate(id)
      .then((customer) => {
        customer.dues = customer.dues + dues;
        customer.points = customer.points + points;

        customer
          .save()
          .then(() => res.json("Current Customer's data Updated !"))
          .catch((err) => res.status(400).json("Error : " + err));
      })
      .catch((err) => res.status(400).json("Error : " + err));
  }
);

module.exports = router;
