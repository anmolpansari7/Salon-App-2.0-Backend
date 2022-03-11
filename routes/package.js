const router = require("express").Router();
let Package = require("../models/package.model");

router.route("/").get((req, res) => {
  let status = req.query.status;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  let name = req.query.name;
  const queryPattern = new RegExp(name, "gi");

  let matchObj;
  if (!name) {
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

    matchObj = {
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
  } else {
    matchObj = { name: { $regex: queryPattern } };
  }
  Package.aggregate([
    { $unwind: "$services" },
    { $set: { services: { $toObjectId: "$services" } } },
    {
      $lookup: {
        from: "services",
        let: {
          serviceId: "$services",
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
    { $unwind: "$serviceName" },
    { $set: { services: "$serviceName.name" } },
    { $unset: "serviceName" },
    {
      $match: matchObj,
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        gender: { $first: "$gender" },
        packageAmount: { $first: "$packageAmount" },
        totalAmount: { $first: "$totalAmount" },
        validFrom: { $first: "$validFrom" },
        validTill: { $first: "$validTill" },
        createdAt: { $first: "$createdAt" },
        maxUsage: { $first: "$maxUsage" },
        services: { $push: "$services" },
        customers: { $first: "$customers" },
      },
    },
  ])
    .then((packages) => {
      res.json(packages);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});

router.route("/create").post((req, res) => {
  const newPackage = new Package({
    gender: req.body.gender,
    name: req.body.name,
    services: req.body.services,
    totalAmount: req.body.totalAmount,
    packageAmount: req.body.packageAmount,
    maxUsage: req.body.maxUsage,
    validFrom: req.body.validFrom,
    validTill: req.body.validTill,
    customers: [],
  });

  newPackage
    .save()
    .then(() => res.json("Package Saved !"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/active-package-list").get((req, res) => {
  let startDate = new Date();
  const currYear = startDate.getFullYear();
  startDate.setFullYear(currYear - 5);

  let endDate = new Date();
  endDate.setFullYear(currYear + 5);

  Package.aggregate([
    {
      $match: {
        $or: [
          { validFrom: { $gte: startDate, $lte: endDate } },
          { validTill: { $gte: startDate, $lte: endDate } },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ])
    .then((packages) => {
      res.json(packages);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});

module.exports = router;
