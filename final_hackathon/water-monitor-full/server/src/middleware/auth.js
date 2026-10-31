const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET is not set in .env - using an insecure default.');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

// Requires "Authorization: Bearer <token>"
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Login required' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
};

// Usage: authorize('admin')
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Only an admin can do this' });

module.exports = { signToken, authenticate, authorize };
