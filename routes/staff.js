const router = require("express").Router();
const Staff = require("../models/staff.model");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream, deleteFile } = require("./s3");

// after uploading to s3 remove from server upload folder
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

let passport = require("passport");
require("../passport-config")(passport);

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), (req, res) => {
    const gender = req.query.gender;
    const name = req.query.name;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let queryPattern = new RegExp(name, "gi");

    let matchObj;
    if (!name) {
      if (!startDate) {
        let newDate = new Date();
        const currYear = newDate.getFullYear();
        newDate.setFullYear(currYear - 20);
        startDate = newDate;
      } else {
        startDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
      }

      if (!endDate) {
        endDate = new Date();
      } else {
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 100);
      }

      matchObj = {
        createdAt: { $gte: startDate, $lte: endDate },
      };
      if (gender !== "") {
        matchObj["gender"] = gender;
      }
    } else {
      matchObj = {
        $or: [
          { name: { $regex: queryPattern } },
          { contact: { $regex: queryPattern } },
        ],
      };
    }

    Staff.aggregate([
      {
        $match: matchObj,
      },
    ])
      .then((staff) => {
        res.json(staff);
      })
      .catch((err) => {
        res.status(400).json("Error : " + err);
      });
  });

router.route("/images").post(upload.single("image"), async (req, res) => {
  const file = req.file;
  console.log(file);
  const result = await uploadFile(file);
  console.log("result", result);
  await unlinkFile(file.path);
  res.send(result);
});

router.route("/images/:key").get((req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

router.route("/images/:key").delete((req, res) => {
  const key = req.params.key;
  const result = deleteFile(key);
  res.send("File Deleted Successfully !");
});

router
  .route("/")
  .post(
    [passport.authenticate("jwt", { session: false }), upload.single("image")],
    (req, res) => {
      const newStaffMember = new Staff({
        gender: req.body.gender,
        name: req.body.name,
        contact: req.body.contact,
        dob: req.body.dob,
        address: req.body.address,
        due: req.body.due,
        aadhar: req.body.aadhar,
      });

      newStaffMember
        .save()
        .then(() => res.json("Staff Added !"))
        .catch((err) => res.status(400).json("Error : " + err));
    }
  );

router
  .route("/:id")
  .patch(
    [passport.authenticate("jwt", { session: false }), upload.single("image")],
    (req, res) => {
      const id = req.params.id;

      Staff.findById(id)
        .then((staff) => {
          staff.gender = req.body.gender;
          staff.name = req.body.name;
          staff.contact = req.body.contact;
          staff.dob = req.body.dob;
          staff.address = req.body.address;
          staff.aadhar = req.body.aadhar;

          staff
            .save()
            .then(() => {
              res.json("Staff Data Updated !");
            })
            .catch((err) => {
              res.status(400).json("Error : " + err);
            });
        })
        .catch((err) => {
          res.status(400).json("Error : " + err);
        });
    }
  );

module.exports = router;
