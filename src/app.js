const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoute");
const urlRoutes = require("./routes/urlRoute");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base Route
app.get("/", (req, res) => {
  res.send("Welcome to the URL Shortener API!");
});

// Routes
app.use("/api", authRoutes);
app.use("/api/shorten", urlRoutes);

module.exports = app;
