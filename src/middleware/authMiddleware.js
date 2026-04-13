const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const getTokenFromRequest = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

const decodeAndLoadUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id).select("-password");
};

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    req.user = await decodeAndLoadUser(token);

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const attachUserIfAny = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      req.user = null;
      res.locals.currentUser = null;
      return next();
    }

    const user = await decodeAndLoadUser(token);
    req.user = user || null;
    res.locals.currentUser = user || null;
    return next();
  } catch (error) {
    req.user = null;
    res.locals.currentUser = null;
    return next();
  }
};

const protectPage = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.redirect("/login?error=Please login first");
    }

    req.user = await decodeAndLoadUser(token);
    if (!req.user) {
      return res.redirect("/login?error=Session expired");
    }

    res.locals.currentUser = req.user;
    return next();
  } catch (error) {
    return res.redirect("/login?error=Invalid session");
  }
};

const authorizePageRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login?error=Please login first");
    }

    if (!roles.includes(req.user.role)) {
      return res.redirect(`/?error=Access denied for ${req.user.role}`);
    }

    return next();
  };
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
  attachUserIfAny,
  protectPage,
  authorizePageRoles,
};