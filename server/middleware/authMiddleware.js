import jwt from "jsonwebtoken";
import { getAuth } from "@clerk/express";
import Company from "../models/Company.js";

export const requireClerkAuth = async (req, res, next) => {
  // Try Clerk middleware's parsed auth first
  const auth = getAuth(req);
  if (auth?.userId) {
    return next();
  }

  // Fallback: for multipart/form-data, decode the Bearer token to get userId
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.decode(token);
      if (decoded?.sub) {
        // Store on a separate key — do NOT overwrite req.auth (Clerk uses it as a function)
        req.clerkUserId = decoded.sub;
        return next();
      }
    } catch (err) {
      console.error('requireClerkAuth decode error:', err.message);
    }
  }

  return res.status(401).json({
    success: false,
    message: "Not authenticated. Please sign in.",
  });
};

export const protectCompany = async (req, res, next) => {
  const headerToken = req.headers.authorization;
  const token =
    req.headers.token ||
    (headerToken && headerToken.startsWith("Bearer ")
      ? headerToken.split(" ")[1]
      : null);

  if (!token) {
    return res.json({
      success: false,
      message: "Not authorized. Login again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const company = await Company.findById(decoded.id).select("-password");

    if (!company) {
      return res.json({
        success: false,
        message: "Company not found.",
      });
    }

    req.company = company;
    req.company_id = company._id;

    next();
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};
