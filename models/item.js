const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
    required: true
  },
  creator: {
    type: String,
    minLength: 1,
    required: true
  },
  likedByUser: [
    {
      type: String
    }
  ]
});

itemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Item', itemSchema);