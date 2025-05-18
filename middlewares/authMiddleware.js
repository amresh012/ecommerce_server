const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    
    try {
      if (token) {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);

        if (!user) {
          return res.status(401).json({ error: "User not found, unauthorized" });
        }

        req.user = user;
        next();
      }
    } catch (error) {
      // Token expired or invalid
      return res.status(401).json({ error: "Not authorized, token expired. Please log in again." });
    }
  } else {
    return res.status(401).json({ error: "No token provided. Authorization denied." });
  }
});


const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized, no user found." });
  }

  const { email } = req.user;
  const adminUser = await User.findOne({ email });

  if (!adminUser || adminUser.role.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Access denied. You are not an admin." });
  }

  next();
});


const checkAccess = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized, no user found." });
  }

  const { email } = req.user;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "User not found, unauthorized." });
  }

  const route = req.originalUrl.split("/")[2];  // Dynamically grab the route

  if (user.role.toLowerCase() === "admin" || 
      (user.role.toLowerCase() === "employee" && user.allowedRoutes.includes(route))) {
    next();
  } else {
    return res.status(403).json({ error: "You are not authorized to access this route." });
  }
});


const isSuper = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized, no user found." });
  }

  const { email } = req.user;
  const adminUser = await User.findOne({ email });

  if (!adminUser || !adminUser.super) {
    return res.status(403).json({ error: "Access denied. You are not a super admin." });
  }

  next();
});

module.exports = { authMiddleware, isAdmin, isSuper, checkAccess };
