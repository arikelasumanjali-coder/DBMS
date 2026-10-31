const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { signToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const fail = (status, message) => Object.assign(new Error(message), { status });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!password || password.length < 6) throw fail(400, 'Password must be at least 6 characters');
  const isFirstUser = (await User.count()) === 0; // first account becomes the admin
  const user = await User.create({
    name, email: (email || '').toLowerCase().trim(),
    password: await bcrypt.hash(password, 10),
    role: isFirstUser ? 'admin' : 'user',
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: (email || '').toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(password || '', user.password))) throw fail(401, 'Wrong email or password');
  res.json({ token: signToken(user), user: publicUser(user) });
});

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
