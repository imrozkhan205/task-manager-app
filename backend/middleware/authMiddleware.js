import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()
export const requireAuth = (req, res, next) => {
  try {
    console.log("🔑 Incoming auth header:", req.headers.authorization);

    const authHeader = req.headers.authorization || '';
    if (!authHeader) {
      console.log("⛔ No Authorization header");
      return res.status(401).json({ message: 'Unauthorized - no header' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      console.log("⛔ No Bearer token found");
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
