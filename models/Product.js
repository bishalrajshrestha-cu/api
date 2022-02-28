const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  photo: {
    type: String,
    default: 'no-photo.jpg',
  },
  title: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  phone: {
    type: String,
  },
  description: {
    type: String,
  },
  quantity: {
    type: String,
  },
  time: {
    type: String,
  },
  location: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Product = mongoose.model('product', ProductSchema);
