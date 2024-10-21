const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.createAdmin = async (req, res, next) => {
  //Not is use ATM but main use is for admins to be able to register mode admins.
  const user = {
    username: req.body.username,
    password: req.body.password,
    role: "admin",
  };
  try {
    const newUser = await User.create(user);

    res.status(201).json({
      message: "sucess",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
