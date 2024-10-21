const express = require("express");
const commentController = require("../controller/CommentController");
const userController = require("../controller/UserController");
const authController = require("../controller/AuthController");

const router = express.Router();

//Route to add a new comment
router.post("/add", authController.protect, commentController.addComment);

//Route to get all comments for a specific post
router.get("/post/:postId", commentController.getCommentsByPost);

//Route to udpate a commend by id
router.patch(
  "/update/:commentId",
  authController.protect,
  commentController.updateComment
);

//Route to delete a comment
router.delete(
  "/delete/:commentId",
  authController.protect,
  commentController.deleteComment
);

module.exports = router;
