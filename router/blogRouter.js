const express = require("express");
const blogController = require("../controller/BlogController");
const userController = require("../controller/UserController");
const authController = require("../controller/AuthController");

const router = express.Router();

//Route to create new post
router.post(
  "/create",
  authController.protect,
  blogController.uploadImg,
  blogController.createBlog
);

//Route to get posts for the logged in user
router.get("/user/me", authController.protect, blogController.getUserBlog);

//Route to get a single post by id passed as a parameter
router.get("/:id", authController.protect, blogController.getBlog);

//Route to get all posts
router.get("/", authController.protect, blogController.getAllBlogs);

//Route to delete a post by id uing a parameter
router.delete("/delete/:id", authController.protect, blogController.deletePost);

//Route to edit a post
router.patch(
  "/edit",
  authController.protect,
  blogController.uploadImg,
  blogController.editPost
);

module.exports = router;
