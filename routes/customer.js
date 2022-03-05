const router = require("express").Router();
let Customer = require("../models/customer.model");

// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/").get((req, res) => {
  Customer.find()
    .then((customer) => res.json(customer))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/total-female-customers").get((req, res) => {
  Customer.count({ gender: "F" })
    .then((customer) => res.json(customer))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/total-male-customers").get((req, res) => {
  Customer.count({ gender: "M" })
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

    Customer.findById(id)
      .then((customer) => res.json(customer))
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
