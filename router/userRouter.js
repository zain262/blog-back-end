const express = require("express");
const userController = require("../controller/UserController");
const authController = require("../controller/AuthController");

const router = express.Router();

//Route to sign up a user
router.post("/signup", authController.signup);

//Route to log in a user
router.post("/login", authController.login);

//Route to create an admin account (Not in use ATM)
router.post(
  "/create-admin",
  authController.protect,
  authController.adminAccess,
  userController.createAdmin
);

//Route to get the users info
router.get("/me", authController.protect, authController.getMe);

//Route to log out
router.get("/logout", authController.logout);

module.exports = router;
