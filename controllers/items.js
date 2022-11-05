const itemsRouter = require('express').Router();
const Item = require('../models/item');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

itemsRouter.get('/', async (request, response) => {
  const items = await Item
    .find({})
    .populate('likedByUser', { name: 1 });

  response.status(200).json(items);
});

itemsRouter.get('/:id', async (request, response) => {
  const item = await Item
    .find({ id: request.params.id })
    .populate('likedByUser', { name: 1 });

  response.status(200).json(item);
});

itemsRouter.post('/', async (request, response) => {

  if (!request.body.name || !request.body.creator) {
    return response.status(400).json({
      error: 'All item parameters must be filled out'
    });
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

  if (!user) {
    return response.status(400).json({
      error: 'Unauthorized to populate new item, please login!'
    });
  }

  const item = new Item({
    name: request.body.name,
    creator: user.name,
  });

  const savedItem = await item.save();

  user.items = user.items.concat(savedItem._id);
  await user.save();

  return response.status(201).json(savedItem);
});

itemsRouter.delete('/:id', async (request, response) => {

  await Item.findById(request.params.id);

  if (await hasOwnership(request)) {
    await Item.findByIdAndDelete(request.params.id);
    return response.status(204).end();

  } else {
    return response.status(401).json({
      error: 'Unauthorized access to delete item!'
    });
  }
});

itemsRouter.patch('/:id', async (request, response) => {

  const item = await Item.findById(request.params.id);
  const usersLikedThis = item.likedByUser;

  const user = await User.findById(request.user._id);

  const prevLiked = item.likedByUser.find(u => u === user.name);
  if (prevLiked) {
    usersLikedThis.pop(user.name);
  } else {
    usersLikedThis.push(user.name);
  }

  const updatedItem = await Item.findByIdAndUpdate(
    request.params.id,
    { likedByUser: usersLikedThis },
    { new: true, runValidators: true, context: 'query' }
  );

  return response.status(200).json(updatedItem);
});


const hasOwnership = async (request) => {

  if (request.user) {
    const userOwnsItem = request.user.items.find(
      itemObjectId => itemObjectId.toJSON() === request.params.id
    );

    if (userOwnsItem) {
      return true;
    }
  }
  return false;
};

module.exports = itemsRouter;