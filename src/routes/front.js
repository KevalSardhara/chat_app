const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require("../controllers/user");
const auth = require("../middlewares/auth");
const multer = require("multer");
const upload = multer();
const formData = multer().none();
const fs = require("fs");

router.route("/signup").post(formData, userController.signup);
router.route("/signin").post();
router.route("/profile").get();

module.exports = router;