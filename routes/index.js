const postController = require('../controllers/postController')
const replyController = require('../controllers/replyController')
const userController = require('../controllers/userController')
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      return next()
    }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

module.exports = app => {
  app.get('/', (req, res) => {
    res.redirect('/posts')
  })

  /* 註冊及登入 */

  app.get('/signin', userController.signInPage)
  app.post(
    '/signin',
    passport.authenticate('local', {
      failureRedirect: '/signin',
      failureFlash: true
    }),
    userController.signIn
  )
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  /* POST相關 */

  app.get('/posts', postController.getPosts)
  app.get('/posts/create', authenticated, postController.createPost)
  app.get('/posts/:id', postController.getPost)
  app.post('/posts', postController.addPost)
  app.get('/posts/:id/edit', postController.editPost)
  app.put('/posts/:id', postController.putPost)
  app.delete('/posts/:id', postController.deletePost)
  app.post('/posts/:id/clap', authenticated, replyController.clap)
  app.post('/posts/:id/unclap', authenticated, replyController.unClap)
  app.post('/posts/:id/reply', replyController.addReply)
  app.delete('/posts/:id/replies/:reply_id', replyController.deleteReply)
  app.post('/posts/:id/bookmark', replyController.addBookmark)
  app.delete('/posts/:id/bookmark', replyController.deleteBookmark)

  /* 使用者 */

  app.get('/users/:id', userController.getUser)
  app.get('/users/:id/edit', userController.editUser)
  app.get('/users/:id/claps', userController.getClaps)
  app.get('/users/:id/highlights', userController.getHighlights)
  app.get('/users/:id/responses', userController.getResponses)
  app.post('/users/:id/follow', authenticated, userController.addFollowing)
  app.delete('/users/:id/follow', authenticated, userController.deleteFollowing)
  app.get('/users/:id/followers', userController.getFollowers)
  app.get('/users/:id/followings', userController.getFollowings)
}
