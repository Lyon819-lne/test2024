const express = require('express');
const mongoose = require('mongoose');

const app = express();

// 连接 MongoDB 
mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 路由
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});