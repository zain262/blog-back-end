const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

//Import all the routes
const blogRoutes = require("./router/blogRouter");
const commentRoutes = require("./router/commentRouter");
const userRoutes = require("./router/userRouter");

//Initialize cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//Add cookie parser for jwt
app.use(cookieParser());

app.use(express.json());

//data base connection string
const DB =
  "mongodb+srv://Zain262:DFmwEFTe5!LhLGb@cluster0.wetna.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0";

//Connect to the backend
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTION SUCCESSFUL");
  })
  .catch((err) => {
    console.error("DB CONNECTION ERROR:", err);
  });

app.get("/", (req, res) => {
  res.json({
    message: "hello",
  });
});

//Add the routers
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/users", userRoutes);

//Add a listener
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
