const router = require("express").Router();
let Package = require("../models/package.model");

// router.route("/").get((req, res) => {
//   let status = req.query.status;
//   let startDate = req.query.startDate;
//   let endDate = req.query.endDate;

//   const matchObj = {
//     createdAt: { $gte: startdate, $lte: enddate },
//   };

//   Package.find()
// })

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

module.exports = router;
