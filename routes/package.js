const router = require("express").Router();
let Package = require("../models/package.model");
let Customer = require("../models/customer.model");
const { default: mongoose } = require("mongoose");

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let name = req.query.name;
    const queryPattern = new RegExp(name, "gi");

    let matchObj;
    if (!name) {
      if (!startDate) {
        let newDate = new Date();
        const currYear = newDate.getFullYear();
        newDate.setFullYear(currYear - 10);
        startDate = newDate;
      } else {
        startDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
      }

      if (!endDate) {
        let newDate = new Date();
        const currYear = newDate.getFullYear();
        newDate.setFullYear(currYear + 10);
        endDate = newDate;
      } else {
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 100);
      }

      matchObj = {
        $nor: [
          { createdAt: { $gt: endDate } },
          { createdAt: { $lt: startDate } },
        ],
      };
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
          createdAt: { $first: "$createdAt" },
          validFor: { $first: "$validFor" },
          maxUsage: { $first: "$maxUsage" },
          services: { $push: "$services" },
          customers: { $first: "$customers" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
      .then((packages) => {
        res.json(packages);
      })
      .catch((err) => res.status(400).json("Error :" + err));
  });

router
  .route("/create")
  .post(passport.authenticate("jwt", { session: false }), (req, res) => {
    const newPackage = new Package({
      gender: req.body.gender,
      name: req.body.name,
      services: req.body.services,
      totalAmount: req.body.totalAmount,
      packageAmount: req.body.packageAmount,
      maxUsage: req.body.maxUsage,
      validFor: req.body.validFor,
      customers: [],
    });

    newPackage
      .save()
      .then(() => res.json("Package Saved !"))
      .catch((err) => res.status(400).json("Error: " + err));
  });

router
  .route("/active-package-list")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    let startDate = new Date();
    const currYear = startDate.getFullYear();
    startDate.setFullYear(currYear - 10);

    let endDate = new Date();
    endDate.setFullYear(currYear + 10);

    Package.aggregate([
      {
        $match: {
          $nor: [
            { createdAt: { $gt: endDate } },
            { createdAt: { $lt: startDate } },
          ],
        },
      },
    ])
      .then((packages) => {
        res.json(packages);
      })
      .catch((err) => res.status(400).json("Error :" + err));
  });

router
  .route("/assign-package")
  .patch(passport.authenticate("jwt", { session: false }), (req, res) => {
    const customerId = mongoose.Types.ObjectId(req.body.customerId);
    const packageId = req.body.packageId;
    const maxUsage = req.body.maxUsage;
    const validTill = req.body.validTill;

    const pack = {
      packageId: packageId,
      validTill: validTill,
      UsageLeft: maxUsage,
    };

    Customer.findById(customerId)
      .then((customer) => {
        customer.package.push(pack);
        customer.save();
        res.json("Package Assigned ! ");
      })
      .catch((err) => {
        res.status(400).json("Error : " + err);
      });
  });

module.exports = router;
