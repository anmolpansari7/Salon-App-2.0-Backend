const router = require("express").Router();
const Package = require("../models/package.model");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const InventoryItem = require("../models/InvetoryItem.model");

const { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/")
  .post(passport.authenticate("jwt", { session: false }), async (req, res) => {
    const newOrder = new Order({
      type: req.body.type,
      branchId: req.body.branchId,
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

    const currentCustomer = await Customer.findById(newOrder.customerId);

    let messageContent = `Dear Customer\n Order Placed!\n Bill Amount: ${
      newOrder.totalAmount
    }\n Paid Amound: ${newOrder.paidAmount}\n Due: ${
      newOrder.totalAmount - newOrder.paidAmount
    }\n Points Earned: ${
      newOrder.pointsEarned
    }\n Thank You!\n Come Back Soon...\n Style Zone`;

    if (newOrder.type === "package-usage") {
      const query = {
        _id: newOrder.customerId,
        "package.packageId": newOrder.packageId,
      };
      const updateDocument = {
        $inc: { "package.$.UsageLeft": -1 },
      };

      await Customer.updateOne(query, updateDocument);
      let UsageLeft = -1;
      currentCustomer.package.forEach((pack) => {
        if (pack.packageId === newOrder.packageId && pack.UsageLeft > 0) {
          UsageLeft = pack.UsageLeft - 1;
        }
      });

      const currPack = await Package.findById(newOrder.packageId);
      messageContent = `Package Usage Successful!\n Pakage Name: ${currPack.name}\n Usage Left: ${UsageLeft} \n Thank You!\n Come Back Soon...\n Style Zone`;
    } else if (newOrder.type === "package-assign") {
      const currPack = await Package.findById(newOrder.packageId);
      messageContent = `Package Assigned! \n Package Name: ${currPack.name}\n Valid for: ${currPack.validFor} \n Usage Left: ${currPack.maxUsage} \n Thank You!\n Come Back Soon...\n Style Zone`;
    } else if (newOrder.inventoryItemIds.length > 0) {
      newOrder.inventoryItemIds.forEach(async (item) => {
        const query = {
          _id: item._id,
          "distributions.branchId": newOrder.branchId,
        };
        const updateDocument = {
          $inc: { "distributions.$.quantity": -item.quantity },
        };

        await InventoryItem.updateOne(query, updateDocument);
      });
    }

    newOrder
      .save()
      .then(async () => {
        const credentials = fromNodeProviderChain();
        const snsClient = new SNSClient({ credentials });

        const params = {
          Message: messageContent /* required */,
          PhoneNumber: `+91${currentCustomer.contact}`, //PHONE_NUMBER, in the E.164 phone number structure
        };

        const run = async () => {
          try {
            const data = await snsClient.send(new PublishCommand(params));
            res.send(data);
          } catch (err) {
            res.json("Error : " + err);
          }
        };
        // run();
        res.json("Order Placed!");
      })
      .catch((err) => res.status(400).json("Error: " + err));
  });

module.exports = router;
