const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const pageRoutes = require("./routes/pageRoutes");
const { attachUserIfAny } = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(attachUserIfAny);
app.use((req, res, next) => {
  res.locals.query = req.query || {};
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/", pageRoutes);

app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ message: "Route not found" });
  }

  return res.status(404).render("404");
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (req.originalUrl.startsWith("/api/")) {
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(500).render("error");
});

module.exports = app;