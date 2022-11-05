const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('items', { name: 1, likedByUser: 1 });

  return response.status(200).json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    });
  }

  if (username.length < 8) {
    return response.status(400).json({
      error: 'username length must be 8 or more characters'
    });
  }

  if (username.length > 20) {
    return response.status(400).json({
      error: 'username length must under 21 characters'
    });
  }

  if (name.length < 3) {
    return response.status(400).json({
      error: 'name length must be more than 3 characters'
    });
  }

  if (name.length > 20) {
    return response.status(400).json({
      error: 'name length must be under 21 characters'
    });
  }

  if (password.length < 6) {
    return response.status(400).json({
      error: ' password length must be more than 5 characters'
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

module.exports = usersRouter;