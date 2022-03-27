const mongoose = require("mongoose");
const router = require("express").Router();
let InventoryItem = require("../models/InvetoryItem.model");

router.route("/").get((req, res) => {
  InventoryItem.find()
    .then((items) => {
      res.json(items);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});

router.route("/add").post((req, res) => {
  const gender = req.body.gender;
  const name = req.body.name;
  const cost = req.body.cost;

  const newInventoryItem = new InventoryItem({
    gender,
    name,
    cost,
  });

  newInventoryItem
    .save()
    .then(() => res.json("Item Saved !"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/distributions").patch(async (req, res) => {
  let itemId = req.body.itemId;
  const branchId = req.body.branchId;
  const quantity = req.body.quantity;

  let hasDoc = await InventoryItem.countDocuments({
    _id: mongoose.Types.ObjectId(itemId),
    "distributions.branchId": branchId,
  });

  if (hasDoc > 0) {
    await InventoryItem.updateOne(
      { _id: itemId, "distributions.branchId": branchId },
      { $inc: { "distributions.$.quantity": quantity } }
    )
      .then(() => res.json("Item Saved !"))
      .catch((err) => res.status(400).json("Error: " + err));
  } else {
    await InventoryItem.updateOne(
      { _id: itemId },
      {
        $push: {
          distributions: {
            branchId: branchId,
            quantity: quantity,
          },
        },
      }
    )
      .then(() => res.json("Item Saved !"))
      .catch((err) => res.status(400).json("Error: " + err));
  }
});

module.exports = router;
