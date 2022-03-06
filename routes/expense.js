const router = require("express").Router();
const mongoose = require("mongoose");
const Expense = require("../models/expense.model");
const ExpenseCategory = require("../models/expense-category.model");

// let passport = require("passport");
// require("../passport-config")(passport);

router.route("/").get((req, res) => {
  Expense.aggregate([
    { $set: { category: { $toObjectId: "$category" } } },
    {
      $lookup: {
        from: "expensecategories",
        let: {
          categoryId: "$category",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"],
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
        as: "categoryName",
      },
    },
    { $unwind: "$categoryName" },
    { $set: { category: "$categoryName.name" } },
    { $unset: "categoryName" },
  ])
    .then((expense) => res.json(expense))
    .catch((err) => res.status(400).json("Error :" + err));
});

router.route("/categories").get((req, res) => {
  ExpenseCategory.find()
    .then((categories) => res.json(categories))
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/add-expense-category").post((req, res) => {
  const newCategory = new ExpenseCategory({
    name: req.body.name,
  });

  newCategory
    .save()
    .then(() => res.json("Expense Category Added !"))
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/add").post((req, res) => {
  const newExpense = new Expense({
    branch: req.body.branch,
    category: req.body.category,
    amount: req.body.amount,
    remark: req.body.remark,
  });

  newExpense
    .save()
    .then(() => res.json("Expense Added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/delete-expense-category/:id").patch((req, res) => {
  const id = req.params.id;
  ExpenseCategory.findById(id)
    .then((category) => {
      category.status = req.body.status;
      category
        .save()
        .then(() => res.json("Category Deleted!"))
        .catch((err) => res.status(400).json("Err: " + err));
    })
    .catch((err) => res.status(400).json("Error : " + err));
});

router.route("/summary").get((req, res) => {
  let branch = req.query.branch;
  let startdate = req.query.startdate;
  let enddate = req.query.enddate;

  if (!startdate) {
    startdate = new Date();
    startdate.setDate(1);
    startdate.setHours(0, 0, 0, 0);
  } else {
    startdate = new Date(startdate);
    startdate.setHours(0, 0, 0, 0);
  }

  if (!enddate) {
    enddate = new Date();
  } else {
    enddate = new Date(enddate);
    enddate.setHours(23, 59, 59, 100);
  }

  const matchObj = {
    createdAt: { $gte: startdate, $lte: enddate },
  };

  if (branch) {
    matchObj["branch"] = mongoose.Types.ObjectId(branch);
  }

  Expense.aggregate([
    { $set: { category: { $toObjectId: "$category" } } },
    { $set: { branch: { $toObjectId: "$branch" } } },
    {
      $lookup: {
        from: "expensecategories",
        let: {
          categoryId: "$category",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"],
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
        as: "categoryName",
      },
    },
    { $unwind: "$categoryName" },
    { $set: { category: "$categoryName.name" } },
    { $unset: "categoryName" },
    {
      $match: matchObj,
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
      },
    },
  ])
    .then((expense) => {
      res.json(expense);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});

router.route("/details").get((req, res) => {
  let branch = req.query.branch;
  let startdate = req.query.startdate;
  let enddate = req.query.enddate;

  if (!startdate) {
    startdate = new Date();
    startdate.setDate(1);
    startdate.setHours(0, 0, 0, 0);
  } else {
    startdate = new Date(startdate);
    startdate.setHours(0, 0, 0, 0);
  }

  if (!enddate) {
    enddate = new Date();
  } else {
    enddate = new Date(enddate);
    enddate.setHours(23, 59, 59, 100);
  }

  const matchObj = {
    createdAt: { $gte: startdate, $lte: enddate },
  };

  if (branch) {
    matchObj["branch"] = mongoose.Types.ObjectId(branch);
  }

  Expense.aggregate([
    { $set: { category: { $toObjectId: "$category" } } },
    { $set: { branch: { $toObjectId: "$branch" } } },
    {
      $lookup: {
        from: "expensecategories",
        let: {
          categoryId: "$category",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"],
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
        as: "categoryName",
      },
    },
    { $unwind: "$categoryName" },
    { $set: { category: "$categoryName.name" } },
    { $unset: "categoryName" },
    {
      $match: matchObj,
    },
  ])
    .then((expense) => {
      // console.log("expense", expense);
      res.json(expense);
    })
    .catch((err) => res.status(400).json("Error :" + err));
});
module.exports = router;
