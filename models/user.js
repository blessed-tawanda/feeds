const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

var UserSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  upvotes: [{
    type: String
  }],
  downvotes: [{
    type: String
  }]
})

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this
  return User.findOne({email}).then( (user) => {
    if (user) {
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (!err && result) {
            resolve(user)
          } else {
            reject()
          }
        })
      })
    } else {
      return Promise.reject()
    }
  })
}

UserSchema.pre('save', function(next) {
  var user = this

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err,salt) => {
      bcrypt.hash(user.password,salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  }else {
    next()
  }
})

var User = mongoose.model('User', UserSchema)

module.exports = User