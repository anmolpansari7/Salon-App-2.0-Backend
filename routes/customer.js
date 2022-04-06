const router = require("express").Router();
const { default: mongoose } = require("mongoose");
let Customer = require("../models/customer.model");
let ServiceSchema = require("../models/service.model");

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
