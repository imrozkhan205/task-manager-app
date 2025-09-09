import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()
// Add this to your authMiddleware.js temporarily for debugging
  export const requireAuth = (req, res, next) => {
  try {
    console.log("=== DEBUGGING AUTH MIDDLEWARE ===");
    console.log("🔑 Method:", req.method);
    console.log("🔑 URL:", req.url);
    console.log("🔑 Raw headers object:", req.headers);
    console.log("🔑 Authorization header:", req.headers.authorization);
    console.log("🔑 Header keys:", Object.keys(req.headers));
    console.log("====================================");

    const authHeader = req.headers.authorization || '';
    if (!authHeader) {
      console.log("⛔ No Authorization header found");
      return res.status(401).json({ message: 'Unauthorized - no header' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      console.log("⛔ No Bearer token found in:", authHeader);
      return res.status(401).json({ message: 'Unauthorized - no token' });
    }

    const secret = process.env.JWT_SECRET;
    console.log("🔍 Using secret:", secret ? "Loaded ✅" : "Missing ❌");

    const payload = jwt.verify(token, secret);
    console.log("✅ Token verified, payload:", payload);

    req.userId = payload.sub;
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
