const router = require("express").Router();
const Branch = require("../models/branch.model");

router.route("/").get((req, res) => {
  Branch.find()
    .then((branches) => res.json(branches))
    .catch((err) => res.status(400).json("Error :" + err));
});

router.route("/add").post((req, res) => {
  const newBranch = new Branch({
    name: req.body.name,
    password: req.body.password,
  });

  newBranch
    .save()
    .then(() => res.json("New Branch Added !"))
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/delete/:id").patch((req, res) => {
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
