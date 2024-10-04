const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require("../controllers/user");
const { userAuthorized: checkAuth } = require("../middlewares/auth");
const chatController = require("../controllers/chat.controller");
const multer = require("multer");
const upload = multer();
const formData = multer().none(); // In case you need to handle a text-only multipart form, you should use the .none() method
const fs = require("fs");

router.route("/signup").post(formData, userController.signup);
router.route("/signin").post(formData, userController.signin);
router.route("/dashboard").get(formData, checkAuth, userController.dashboard);
router.route("/logout").post(formData, checkAuth, userController.logout);
router.route("/available_friends").post(formData, checkAuth, chatController.available_friends);
router.route("/send_friend_request").post(formData, checkAuth, chatController.send_friend_request);

module.exports = router;