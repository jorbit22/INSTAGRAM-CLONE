const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const PORT = 2500;
const { MONGOURI } = require("./keys");
const { ObjectId } = mongoose.Types;

require("./models/user");
require("./models/post");

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.log("error connecting to MongoDB:", err);
});

app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

// Serve the frontend build files
app.use(express.static(path.join(__dirname, "client/build")));

// Catch-all route to render the frontend application
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
