require('./config/config')
const express = require('express')
const mongoose = require('./db/mongoose')
const Post = require('./models/post')
const User = require('./models/user')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const path = require('path')
const session = require('express-session')


let app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use('/', express.static(path.join(__dirname,'public')))
app.set('view-engine', 'ejs')

const redirectLogIn = (req,res,next) => {
  if(!req.session.userId) { 
    res.redirect('/login')
  } else {
    next()
  }
}

app.use(session({
  name: 'sid',
  secret: 'no',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    sameSite: true,
    secure: false 
  }
}))

app.get('/login', async (req, res) => {
  res.render('login.ejs', {error: undefined})
})

app.post('/login', async (req, res) => {
  let {email, password} = req.body
  User.findByCredentials(email, password)
  .then((user) => {
    req.session.userId = user._id
    res.redirect('/')
  })
  .catch((err) => {
    console.log(err)
    res.render('login.ejs', {error: 'Could Not Log You In Wrong Email And Password'})
  })
})

app.get('/register', async (req,res) => {
  res.render('register.ejs')
})

app.post('/register', async (req, res) => {
  const {username, password, email} = req.body
  var user = new User({
    username,
    password,
    email
  })

  user.save()
  req.session.userId = user._id
  res.render('welcome.ejs', {username})
})

app.get('/', redirectLogIn ,async (req,res) => {
  var posts = []
  await Post.find({}).then((post) => {
    posts.push(...post)
  })
  var posts = posts.reverse()
  res.render('index.ejs', {posts})
})

app.post('/post', redirectLogIn ,(req,res) => {
  var post = new Post({
    post: req.body.post
  })
  post.save()
  res.redirect('/')
})

app.get('/upvote/:id', redirectLogIn ,async (req,res) => {
  await Post.findOne({_id: req.params.id})
  .then((post) => {
    User.findById(req.session.userId)
    .then((user) => {
      if(!user.upvotes.includes(post._id) && !user.downvotes.includes(post._id)){
        user.upvotes.push(post._id)
        post.upvotes += 1
        post.save()
        user.save()
        res.redirect('/')
      } else {
        res.redirect('/')
      }
    })
  })
  .catch((err) => {
    console.log(err)
    res.redirect('/')
  })
  
})

app.get('/downvote/:id', redirectLogIn ,async (req,res) => {
  await Post.findOne({_id: req.params.id})
  .then((post) => {
    User.findById(req.session.userId)
    .then((user) => {
      if(!user.downvotes.includes(post._id) && !user.upvotes.includes(post._id)){
        user.downvotes.push(post._id)
        post.downvotes += 1
        post.save()
        user.save()
        res.redirect('/')
      } else {
        res.redirect('/')
      }
    })
  })
  .catch((err) => {
    console.log(err)
    res.redirect('/')
  })
})

app.get('/reply/:id',redirectLogIn ,async (req,res) => {
  let postReply = ''
  await Post.findOne({_id: req.params.id})
  .then((post) => {
    postReply = post
  })
  res.render('reply.ejs', {postReply})
})

app.post('/replypost/:id',redirectLogIn ,async (req, res) => {
  let comment = {
    text: req.body.post
  }
  await Post.findOne({_id: req.params.id})
  .then((post) => {
    post.comment.push(comment)
    post.save()
  })
  .catch((err) => {
    console.log(err)
  })
  res.redirect('/')
})

app.get('/logout', redirectLogIn, (req,res) => {
  req.session.destroy((err) => {
    if(err)
      return res.redirect('/home')
    res.clearCookie('sid')
    res.redirect('/login')    
  })
})

app.get('/settings', redirectLogIn, (req,res) => {
  res.render('settings.ejs')
})

app.get('/viewpost/:id',redirectLogIn ,async (req, res) => {
  await Post.findOne({_id: req.params.id})
  .then((post) => {
    res.render('viewpost.ejs', {post})
  })
})

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT + ' Listening')
})

