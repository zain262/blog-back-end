const Blog = require("../models/BlogModel");
const multer = require("multer");
const path = require("path");

const multerStorage = multer.diskStorage({
  //Create file path of where to save the images
  destination: (req, file, cb) => {
    cb(null, path.join("C:/Users/zain2/Desktop/blog-app/public"));
  },
  //Create a file name structure for the images
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];

    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  //FIlter out only images
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("please only images."), false);
  }
};

const upload = multer({
  //Set the multer parameters
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImg = upload.single("imageUrl");

exports.createBlog = async (req, res, next) => {
  try {
    //console.log("req.body in create!", req.body);
    //console.log("req.file in create!", req.file);

    const imageUrl = req.file ? req.file.path : null;
    //Check if a image is present

    //Create a new blog
    const newBlog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      authorName: req.user.username,
      authorId: req.user.id,
      imageUrl: imageUrl,
    });

    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Blog creation failed",
      error: err.message,
    });
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    //get the blog id from the params
    const blogId = req.params.id;

    //Search for the blog with that id
    const post = await Blog.findById(blogId);

    //If such id doesnt exist send a error
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        blog: post,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error retrieving the blog post",
      error: err.message,
    });
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    //Get all blogs from the back end and send them
    const posts = await Blog.find();

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: {
        blogs: posts,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error retrieving the blog posts",
      error: err.message,
    });
  }
};

exports.getUserBlog = async (req, res, next) => {
  try {
    //Get the author id from user (set in protect)
    const authorId = req.user.id;

    //Get all the posts
    const posts = await Blog.find({ authorId: authorId });

    //return an empty array if no posts by the user
    if (posts.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          blogs: [],
        },
      });
    }

    //Send the posts
    res.status(200).json({
      status: "success",
      data: {
        blogs: posts,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error retrieving user's blog posts",
      error: err.message,
    });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    //Get the post info from params and user
    const blogId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    //Find the blog
    const post = await Blog.findById(blogId);

    //If blog doesnt exist send a error
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No blog post found with that ID",
      });
    }

    //console.log(req.user.id, post.authorId.toString());
    if (
      post.authorId.toString() !== userId.toString() &&
      userRole !== "admin"
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to delete this post",
      });
    }
    //If they user isnt authoized send an error

    //Otherwise delete the post and send a sucess response
    await Blog.deleteOne({ _id: blogId });

    res.status(200).json({
      status: "success",
      message: "Blog post successfully deleted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error deleting the blog post",
      error: err.message,
    });
  }
};

exports.editPost = async (req, res, next) => {
  try {
    const blogId = req.body._id;
    const userId = req.user.id;
    const userRole = req.user.role;

    //Get the blog and user info from params

    //console.log(blogId);

    //Find the blog
    const post = await Blog.findById(blogId);

    //If blog doesnt exist send an error
    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "No blog post found with that ID",
      });
    }

    if (
      post.authorId.toString() !== userId.toString() &&
      userRole !== "admin"
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to edit this post",
      });
    }
    //Ensure the user is authorized

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      imageUrl: req.file ? req.file.path : post.imageUrl,
    };

    //Get the new data to update the blog with

    const updatedPost = await Blog.findOneAndUpdate(
      { _id: blogId },
      updateData,
      { new: true, runValidators: true }
    );

    //Update the blog

    if (!updatedPost) {
      return res.status(404).json({
        status: "fail",
        message: "No blog post found with that ID",
      });
    }
    //Throw error if somethig went wrong

    res.status(200).json({
      status: "success",
      message: "Blog post successfully updated",
      data: {
        blog: updatedPost,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Error updating the blog post",
      error: err.message,
    });
  }
};
