const mongoose = require('mongoose');

// Articles Schema
const articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true,
  },
  author:{
    type: String,
    required: true,
  },
  body:{
    type: String,
    required: true,
  },
});

const Article = module.exports = mongoose.model('Article', articleSchema);
