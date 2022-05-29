const router = require("express").Router();
const Message = require("../models/message.model");

require("dotenv").config();

const { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");

router.route("/").get((req, res) => {
  Message.find()
    .then((previousMessages) => {
      res.json(previousMessages);
    })
    .catch((err) => {
      res.status(400).json("Error :", err);
    });
});

router.route("/").post((req, res) => {
  const credentials = fromNodeProviderChain();
  const snsClient = new SNSClient({ credentials });
  // const params = {
  //   Message: "MESSAGE_TEXT" /* required */,
  //   PhoneNumber: "+916264265517", //PHONE_NUMBER, in the E.164 phone number structure
  // };

  // const run = async () => {
  //   try {
  //     const data = await snsClient.send(new PublishCommand(params));
  //     console.log("Success.", data);
  //     res.send(data);
  //   } catch (err) {
  //     console.log("Error", err.stack);
  //   }
  // };
  // run();

  const phoneNumbers = ["9300751515", "6264265517"];
  const smsPromiseArray = [];
  phoneNumbers.forEach((number) => {
    const params = {
      Message: "MESSAGE_TEXT" /* required */,
      PhoneNumber: `+91${number}`, //PHONE_NUMBER, in the E.164 phone number structure
    };
    smsPromiseArray.push(snsClient.send(new PublishCommand(params)));
  });
  Promise.all(smsPromiseArray)
    .then((resolve) => {
      console.log("resolved", resolve);
      res.send(resolve);
    })
    .catch((err) => {
      console.error("Error while sending sms", err);
    });

  /**
   * phoneNumbers => array
   */
  // const phoneNumbers = [];
  // const smsPromiseArray = [];
  // phoneNumbers.forEach((number) => {
  //   const params = {
  //     Message: "MESSAGE_TEXT" /* required */,
  //     PhoneNumber: `+91${number}`, //PHONE_NUMBER, in the E.164 phone number structure
  //   };
  //   const run = async () => {
  //     try {
  //       const data = await snsClient.send(new PublishCommand(params));
  //       console.log("Success.", data);
  //       res.send(data);
  //     } catch (err) {
  //       console.log("Error", err.stack);
  //     }
  //   };
  //   smsPromiseArray.push(run);
  // });
  // smsPromiseArray.forEach((p) => p());
});

module.exports = router;
