const router = require("express").Router();
let Service = require("../models/service.model");

// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/").get((req, res) => {
  Service.find({ status: "active" })
    .then((items) => res.json(items))
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/add").post(
  //   passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newService = new Service({
      gender: req.body.gender,
      category: req.body.category,
      name: req.body.name,
      cost: req.body.cost,
    });

    // console.log(newService);
    newService
      .save()
      .then(() => res.json("Service added!"))
      .catch((err) => res.status(400).json("Error : " + err));
  }
);

router.route("/:id").patch(
  //   passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    Service.findById(id)
      .then((item) => {
        item.status = req.body.status;
        item
          .save()
          .then(() => res.json("Service Deleted!"))
          .catch((err) => res.status(400).json("Err: " + err));
      })
      .catch((err) => res.status(400).json("Error : " + err));
  }
);

module.exports = router;
