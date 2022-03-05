const router = require("express").Router();
const Staff = require("../models/staff.model");

router.route("/add").post((req, res) => {
  const newStaffMember = new Staff({
    gender: req.body.gender,
    name: req.body.name,
    contact: req.body.contact,
    address: req.body.address,
    due: 0,
    aadhar: req.body.aadhar,
  });

  newStaffMember
    .save()
    .then(() => res.json("New staff member added !"))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
