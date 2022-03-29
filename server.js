const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// const passport = require("passport");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// app.use(passport.initialize());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true });
const conection = mongoose.connection;
conection.once("open", () => {
  console.log("MongoDB database connection established successfully.");
});

const serviceRouter = require("./routes/service");
const customerRouter = require("./routes/customer");
const inventoryRouter = require("./routes/inventory");
const expenseRouter = require("./routes/expense");
const branchRouter = require("./routes/branch");
const packageRouter = require("./routes/package");
const promoCodeRouter = require("./routes/promocode");
const pointsCalculatorRouter = require("./routes/pointscalculator");

// const orderRouter = require("./routes/order");
// const pricelistRouter = require("./routes/pricelist");
// const deallistRouter = require("./routes/deallist");
// const pointsCalculatorRouter = require("./routes/pointsCalculator");
// const reportRouter = require("./routes/report");
// const sendSMSRouter = require("./routes/send_sms");
// const authenticationRouter = require("./routes/authentication");

app.use("/service", serviceRouter);
app.use("/customer", customerRouter);
app.use("/inventory", inventoryRouter);
app.use("/expense", expenseRouter);
app.use("/branch", branchRouter);
app.use("/package", packageRouter);
app.use("/promocode", promoCodeRouter);
app.use("/points-calculator", pointsCalculatorRouter);

// app.use("/order", orderRouter);
// app.use("/pricelist", pricelistRouter);
// app.use("/deallist", deallistRouter);
// app.use("/pointsCalculator", pointsCalculatorRouter);
// app.use("/report", reportRouter);
// app.use("/send_sms", sendSMSRouter);
// app.use("/authentication", authenticationRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
