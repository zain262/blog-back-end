const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

exports.signup = async (req, res, next) => {
  try {
    const userInfo = {
      username: req.body.username,
      password: req.body.password,
    };

    //Get the users info

    const newUser = await User.create(userInfo);
    //Create a new user from the info

    const token = jwt.sign(
      { id: newUser._id },
      "LEBRON-LEBRON-LEBRON-LEBRON-23-62",
      {
        expiresIn: "90d",
      }
    );
    //Create a new jwt token form the secret code and user Id

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "None",
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      secure: true,
    });
    //Send the jwt as a cookie

    res.status(201).json({
      message: "success",
      role: newUser.role,
      id: newUser._id,
    });
    //Return the users info as well
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    //Get the users info
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both a username and password.",
      });
    }
    //Ensure both username and password are present

    const user = await User.findOne({ username }).select("+password");
    //Check to see if username even exists

    //If there is no user by that username return an error
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect username or password.",
      });
    }

    //Compare the encrypted user password to the password sent as an attempt to log in
    const compare = await bcrypt.compare(password, user.password);

    //If they dont match send an unauthorized error
    if (!compare) {
      return res.status(401).json({
        message: "Incorrect username or password.",
      });
    }

    //If they match creaet a new jwt
    const token = jwt.sign(
      { id: user._id },
      "LEBRON-LEBRON-LEBRON-LEBRON-23-62",
      {
        expiresIn: "90d",
      }
    );

    //Send the token as a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "None",
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      secure: true,
    });

    req.user = user;

    //Set the user as the user for the next functions

    res.status(200).json({
      role: user.role,
      id: user._id,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  let token;

  //check if the JWT is present in the cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //if no token is found return an unauthorized error
  if (!token) {
    return res.status(401).json({
      message: "You are not logged in! Please log in to get access.",
    });
  }

  try {
    //get the info from the token
    const decoded = await promisify(jwt.verify)(
      token,
      "LEBRON-LEBRON-LEBRON-LEBRON-23-62"
    );

    //Use the id from the token to find the user
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this token does not exist.",
      });
    }

    //Set the users info for the next middleware
    req.user = {
      id: currentUser._id,
      username: currentUser.username,
      role: currentUser.role,
    };

    req.body.userId = currentUser.id;
    req.body.username = currentUser.username;
    req.body.role = currentUser.role;
    // console.log("In protect!", req.user); // Log the user information
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token. Please log in again.",
    });
  }
};

exports.getMe = async (req, res, next) => {
  //Return the users info
  res.status(200).json({
    role: req.user.role,
    username: req.user.username,
    id: req.user.id,
  });
};

exports.adminAccess = async (req, res, next) => {
  //Check if the user is admin if so procedd if not send a authroization error
  if (req.body.role !== "admin") {
    return next(
      res.status(401).json({
        message: "You do not have permission to perform this action",
      })
    );
  }

  next();
};

exports.logout = (req, res, next) => {
  //replace the jwt token with a "dummy" one
  res.cookie("jwt", "loggedout", {
    httpOnly: true,
    sameSite: "None",
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    secure: true,
  });

  res.status(200).json({ status: "success" });
};
