const router = require("express").Router();
let Order = require("../models/order.model");

router.route("/").post((req, res) => {
  const newOrder = new Order({
    type: req.body.type,
    customerId: req.body.customerId,
    serviceIds: req.body.serviceIds,
    inventoryItemIds: req.body.inventoryItemIds,
    totalAmount: req.body.totalAmount,
    paidAmount: req.body.paidAmount,
    paymentMode: req.body.paymentMode,
    remark: req.body.remark,
    pointsUsed: req.body.pointsUsed,
    pointsEarned: req.body.pointsEarned,
    discountGiven: req.body.discountGiven,
    promoCode: req.body.promoCode,
    packageId: req.body.packageId,
    servedBy: req.body.servedBy,
  });

  newOrder
    .save()
    .then(() => res.json("Order Placed !"))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
