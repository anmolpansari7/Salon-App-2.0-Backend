const router = require("express").Router();
let InventoryItem = require("../models/InvetoryItem.model");

router.route("/add").post((req, res) => {
  const gender = req.body.gender;
  const name = req.body.name;
  const cost = req.body.cost;
  const quantity = req.body.quantity;
  const lastAddedOn = Date.parse(req.body.lastAddedOn);
  const lastSoldOn = "";

  const newInventoryItem = new InventoryItem({
    gender,
    name,
    cost,
    quantity,
    lastAddedOn,
    lastSoldOn,
  });

  newInventoryItem
    .save()
    .then(() => res.json("Item Saved !"))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
