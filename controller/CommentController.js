const Comment = require("../models/CommentModel");

exports.addComment = async (req, res, next) => {
  try {
    const { postId, authorId, authorName, content } = req.body;
    //Get the post info from the body
    const newComment = await Comment.create({
      postId,
      authorId,
      authorName,
      content,
    });

    //Create a new comment
    res.status(201).json({
      status: "success",
      data: {
        comment: newComment,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to add comment",
      error: err.message,
    });
  }
};

exports.getCommentsByPost = async (req, res, next) => {
  try {
    //Get the post id from the link
    const postId = req.params.postId;

    const comments = await Comment.find({ postId });
    //Find the comments and return them
    res.status(200).json({
      status: "success",
      data: {
        comments: comments || [],
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to get comments",
      error: err.message,
    });
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    //Get the comment info from params and id
    const commentId = req.params.commentId;
    const userId = req.body.userId;
    const userRole = req.body.role;
    const content = req.body.content;

    const comment = await Comment.findById(commentId);
    //Try to find the comment to ensure that it exists

    if (!comment) {
      return res.status(404).json({
        status: "fail",
        message: "No comment found with that ID",
      });
    }

    //Check if the user is even authorized
    if (comment.authorId.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to edit this comment",
      });
    }

    //Update the comment from the new body
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        comment: updatedComment,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to update comment",
      error: err.message,
    });
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    //Get comment info
    const commentId = req.params.commentId;
    const userId = req.body.userId;
    const userRole = req.body.role;

    const comment = await Comment.findById(commentId);
    //Check if the comment exists
    if (!comment) {
      return res.status(404).json({
        status: "fail",
        message: "No comment found with that ID",
      });
    }

    //Check if the user is authorized
    if (comment.authorId.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to delete this comment",
      });
    }

    //Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.status(204).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to delete comment",
      error: err.message,
    });
  }
};
