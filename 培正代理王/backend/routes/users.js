const express = require('express');
const router = express.Router();
const User = require('../models/user');

// 获取所有用户
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});


// 创建新用户
router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.status(201).json({ user, token });
});


module.exports = router;