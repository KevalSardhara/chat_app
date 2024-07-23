const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require("../controllers/user");
const { userAuthorized: checkAuth } = require("../middlewares/auth");
const multer = require("multer");
const upload = multer();
const formData = multer().none();
const fs = require("fs");

router.route("/signup").post(formData, userController.signup);
router.route("/signin").post(formData, userController.signin);
router.route("/dashboard").get(checkAuth, userController.dashboard);

module.exports = router;