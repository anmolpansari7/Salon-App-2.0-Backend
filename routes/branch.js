const router = require("express").Router();
const bcrypt = require("bcrypt");
const Branch = require("../models/branch.model");

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    Branch.find({
      status: "active",
    })
      .then((branches) => res.json(branches))
      .catch((err) => res.status(400).json("Error :" + err));
  });

router
  .route("/add")
  .post(passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newBranch = new Branch({
        name: req.body.name,
        password: hashedPassword,
      });

      newBranch
        .save()
        .then(() => res.json("New Branch Added !"))
        .catch((err) => res.status(400).json("Error : " + err));
    } catch {
      res.json("Faild to Register");
    }
  });

router
  .route("/delete/:id")
  .patch(passport.authenticate("jwt", { session: false }), (req, res) => {
    const id = req.params.id;
    Branch.findById(id)
      .then((branch) => {
        branch.status = req.body.status;
        branch
          .save()
          .then(() => res.json("Branch Deleted!"))
          .catch((err) => res.status(400).json("Err: " + err));
      })
      .catch((err) => res.status(400).json("Error : " + err));
  });

module.exports = router;
