const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let Owner = require("../models/owner.model");
let Branch = require("../models/branch.model");

require("dotenv").config();

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/owners")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    Owner.find()
      .then((owners) => res.json(owners))
      .catch((err) => res.status(400).json("Err : " + err));
  });

router
  .route("/register-owner")
  .post(passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const name = "Owner";

      const newOwner = new Owner({
        name: name,
        password: hashedPassword,
      });

      newOwner
        .save()
        .then(() => res.json("Owner Added Successfully !"))
        .catch((err) => res.status(400).json("Err : " + err));
    } catch {
      res.json("Faild to Register");
    }
  });

router.route("/login").post((req, res) => {
  const selectedBranch = req.body.selectedBranch;
  const password = req.body.password;

  if (selectedBranch === "owner") {
    Owner.findOne({ name: "Owner" })
      .then(async (owner) => {
        const match = await bcrypt.compare(password, owner.password);
        if (match) {
          let params = {
            _id: owner._id,
            name: owner.name,
          };
          let token = await jwt.sign(params, process.env.JWT_PRIVATE_KEY, {
            expiresIn: "365d",
          });
          res.json({ token: token });
        } else {
          res.json("Unauthorized!");
        }
      })
      .catch((err) => res.status(400).json("Err : " + err));
  } else {
    Branch.findOne({ _id: selectedBranch })
      .then(async (branch) => {
        const match = await bcrypt.compare(password, branch.password);
        if (match) {
          let params = {
            _id: branch._id,
            name: branch.name,
          };
          let token = await jwt.sign(params, process.env.JWT_PRIVATE_KEY, {
            expiresIn: "365d",
          });
          res.json({ token: token });
        } else {
          res.json("Unauthorized!");
        }
      })
      .catch((err) => res.status(400).json("Err : " + err));
  }
});

router
  .route("/change-owner-password")
  .patch(passport.authenticate("jwt", { session: false }), async (req, res) => {
    const newPassword = req.body.newPassword;
    const currentPassword = req.body.currentPassword;
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    Owner.findOne({ name: "Owner" })
      .then(async (owner) => {
        const match = await bcrypt.compare(currentPassword, owner.password);
        if (match) {
          owner.password = newHashedPassword;
          owner
            .save()
            .then(() => res.json("Password Changed!"))
            .catch((err) => res.status(400).json("Err : " + err));
        } else {
          res.status(401).json("UnAuthorized!");
        }
      })
      .catch((err) => res.status(400).json("Err : " + err));
  });

router
  .route("/change-branch-password")
  .patch(passport.authenticate("jwt", { session: false }), async (req, res) => {
    const newPassword = req.body.newPassword;
    const currentPassword = req.body.currentPassword;
    const branchId = req.body.branchId;
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const owner = await Owner.findOne({ name: "Owner" });
    const ownerPassword = owner.password;

    Branch.findById(branchId)
      .then(async (branch) => {
        const match = await bcrypt.compare(currentPassword, ownerPassword);
        if (match) {
          branch.password = newHashedPassword;
          branch
            .save()
            .then(() => res.json("Password Changed!"))
            .catch((err) => res.status(400).json("Err : " + err));
        } else {
          res.status(401).json("UnAuthorized!");
        }
      })
      .catch((err) => res.status(400).json("Err : " + err));
  });
module.exports = router;
