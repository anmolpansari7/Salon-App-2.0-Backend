const mongoose = require("mongoose");
const router = require("express").Router();
let InventoryItem = require("../models/InvetoryItem.model");

router.route("/").get((req, res) => {
  InventoryItem.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $unwind: {
        path: "$distributions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: { branchId: { $toObjectId: "$distributions.branchId" } },
    },
    {
      $lookup: {
        from: "branches",
        let: {
          branchId: "$branchId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$branchId"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
        as: "branchName",
      },
    },
    {
      $unwind: {
        path: "$branchName",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $set: { "distributions.branch": "$branchName.name" } },
    { $unset: "branchName" },
    { $unset: "branchId" },
    {
      $group: {
        _id: "$_id",
        distributions: { $push: "$distributions" },
        name: { $first: "$name" },
        cost: { $first: "$cost" },
        gender: { $first: "$gender" },
        status: { $first: "$status" },
      },
    },
    {
      $sort: { name: 1 },
    },
  ])
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

router.route("/update/:id").patch((req, res) => {
  const id = req.params.id;
  const gender = req.body.gender;
  const name = req.body.name;
  const cost = req.body.cost;

  InventoryItem.findById(id)
    .then((item) => {
      item.name = name;
      item.gender = gender;
      item.cost = cost;
      item
        .save()
        .then(() => {
          res.json("Item Updated !");
        })
        .catch((err) => res.status(400).json("Err: " + err));
    })
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/delete/:id").patch((req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  InventoryItem.findById(id)
    .then((item) => {
      item.status = status;
      item
        .save()
        .then(() => {
          res.json("Item Deleted !");
        })
        .catch((err) => res.status(400).json("Err: " + err));
    })
    .catch((err) => res.status(400).json("Err: " + err));
});

router.route("/distributions").patch(async (req, res) => {
  let itemId = mongoose.Types.ObjectId(req.body.itemId);
  const branchId = req.body.branchId;
  const quantity = parseInt(req.body.quantity);

  let hasDoc = await InventoryItem.countDocuments({
    _id: itemId,
    "distributions.branchId": branchId,
  });

  if (hasDoc > 0) {
    await InventoryItem.updateOne(
      {
        _id: itemId,
        "distributions.branchId": branchId,
      },
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
