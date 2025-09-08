import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const secret = process.env.JWT_SECRET ;
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};