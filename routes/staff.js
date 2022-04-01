const router = require("express").Router();
const Staff = require("../models/staff.model");

router.route("/").get((req, res) => {
  const gender = req.query.gender;
  const name = req.query.name;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
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
    if (gender !== "") {
      matchObj["gender"] = gender;
    }
  } else {
    matchObj = {
      $or: [
        { name: { $regex: queryPattern } },
        { contact: { $regex: queryPattern } },
      ],
    };
  }

  Staff.aggregate([
    {
      $match: matchObj,
    },
  ])
    .then((staff) => {
      res.json(staff);
    })
    .catch((err) => {
      res.status(400).json("Error : " + err);
    });
});

router.route("/").post((req, res) => {
  const newStaffMember = new Staff({
    gender: req.body.gender,
    name: req.body.name,
    contact: req.body.contact,
    dob: req.body.dob,
    address: req.body.address,
    due: req.body.due,
    aadhar: req.body.aadhar,
  });

  newStaffMember
    .save()
    .then(() => res.json("Staff Added !"))
    .catch((err) => res.status(400).json("Error : " + err));
});

module.exports = router;
