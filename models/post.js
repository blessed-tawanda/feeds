const mongoose = require('mongoose')

let post = new mongoose.model('post', {
  post: String,
  upvotes:{
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  comment: [{
    text: String
  }
  ]
})

module.exports = post