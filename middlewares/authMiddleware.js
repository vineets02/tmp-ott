// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// ---------- Auth: require signed-in user ----------
exports.requireSignIn = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ""; // header is lowercased by Express
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)         // strip "Bearer "
      : authHeader;                 // allow raw token too (useful for tests)

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!process.env.JWT_SECRET) {
      // fail fast if secret is missing/misnamed
      return res.status(500).json({ message: "Server JWT secret not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g., { _id: "...", iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Helper to check permission
const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 1 && !user.dynamicRole) return true; // Legacy Super Admin
  if (user.dynamicRole && user.dynamicRole.permissions.includes(permission)) return true;
  return false;
};

// ---------- AuthZ: require super admin role (Full Access) ----------
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user?._id).populate("dynamicRole");
    if (!user) return res.status(401).json({ message: "User not found" });
    
    // Super Admin check (either legacy role 1 or dynamic role with all permissions)
    if (user.role === 1) return next(); 
    
    return res.status(403).json({ message: "Super Admin access denied" });
  } catch (err) {
    return res.status(500).json({ message: "Error in admin middleware" });
  }
};

// ---------- AuthZ: Content Management ----------
exports.canManageContent = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user?._id).populate("dynamicRole");
    if (hasPermission(user, "manage_content")) return next();
    return res.status(403).json({ message: "Access denied: Content Management required" });
  } catch (err) {
    return res.status(500).json({ message: "Error in content middleware" });
  }
};

// ---------- AuthZ: Finance Management ----------
exports.canManageFinance = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user?._id).populate("dynamicRole");
    if (hasPermission(user, "view_finance") || hasPermission(user, "manage_finance")) return next();
    return res.status(403).json({ message: "Access denied: Finance Management required" });
  } catch (err) {
    return res.status(500).json({ message: "Error in finance middleware" });
  }
};

// ---------- AuthZ: Support/User Management ----------
exports.canManageSupport = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user?._id).populate("dynamicRole");
    if (hasPermission(user, "manage_users") || hasPermission(user, "manage_reviews")) return next();
    return res.status(403).json({ message: "Access denied: Support Management required" });
  } catch (err) {
    return res.status(500).json({ message: "Error in support middleware" });
  }
};


