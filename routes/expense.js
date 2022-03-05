const router = require("express").Router();
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

  console.log("branch :", branch);
  console.log("startDate :", startdate);
  console.log("Enddate : ", enddate);

  if (startdate === "") {
    const thismonth = new Date();
    thismonth.setDate(1);
    thismonth.setHours(0, 0, 0, 0);
    startdate = thismonth;
  }

  if (enddate === "") {
    const today = new Date();
    enddate = today;
  }

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
    {
      $match: {
        createdAt: { $gte: startdate, $lte: enddate },
      },
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

module.exports = router;
