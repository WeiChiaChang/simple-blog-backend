const db = require('../models')
const User = db.User
const Post = db.Post
const Reply = db.Reply
const Clap = db.Clap
const helpers = require('../config/helpers')
const Sequelize = require('sequelize')

const postService = {
  getPosts: async (req, res, callback) => {
    const postsResult = await Post.findAll({
      order: Sequelize.literal('rand()'),
      include: User
    })
    const posts = postsResult.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      cover: d.cover,
      readTime: helpers.getReadTime(d.content),
      monthDay: helpers.getMonthDay(String(d.createdAt)),
      authorId: d.User.id,
      author: d.User.name
    }))

    const newPostsResult = await Post.findAll({
      limit: 4,
      order: [['createdAt', 'DESC']],
      include: User
    })
    const newPosts = newPostsResult.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      cover: d.cover,
      readTime: helpers.getReadTime(d.content),
      monthDay: helpers.getMonthDay(String(d.createdAt)),
      authorId: d.User.id,
      author: d.User.name
    }))

    const popularPostsResult = await Post.findAll({
      include: [Clap, User]
    })
    let popularPosts = popularPostsResult.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      cover: d.cover,
      claps:
        d.Claps.length === 0
          ? 0
          : d.Claps.length === 1
          ? d.Claps[0].clap
          : d.Claps.reduce((a, b) => a.clap + b.clap),
      readTime: helpers.getReadTime(d.content),
      monthDay: helpers.getMonthDay(String(d.createdAt)),
      authorId: d.User.id,
      author: d.User.name
    }))
    popularPosts = popularPosts.sort((a, b) => b.claps - a.claps).slice(0, 4)

    return callback({ posts, newPosts, popularPosts })
  },

  getPost: async (req, res, callback) => {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, include: [{ model: User, as: 'Followers' }] },
        { model: Clap, include: User }
      ]
    })
    const clappedUsers = post.Claps.map(d => d.User.name)
    if (clappedUsers.length === 1) {
      post.dataValues.applauseFrom = `Applause from ${clappedUsers[0]}`
    } else if (clappedUsers.length === 2) {
      post.dataValues.applauseFrom = `Applause from ${clappedUsers[0]} and ${clappedUsers[1]}`
    } else if (clappedUsers.length > 2) {
      post.dataValues.applauseFrom = `Applause from ${clappedUsers[0]}, ${
        clappedUsers[1]
      } and ${clappedUsers.length - 2} others`
    }
    if (post.Claps.length) {
      post.dataValues.clappedTimes = post.Claps.map(d => d.clap).reduce(
        (a, b) => a + b
      )
    } else {
      post.dataValues.clappedTimes = 0
    }
    post.dataValues.monthDay = helpers.getMonthDay(String(post.createdAt))
    post.dataValues.readTime = helpers.getReadTime(post.content)

    const author = post.User
    if (req.user) {
      author.isFollowedByCurrentUser = post.User.Followers.map(
        d => d.id
      ).includes(+req.user.id)
    }
    return callback({ post, author })
  },

  addPost: async (req, res, callback) => {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      UserId: req.body.UserId,
      cover: req.body.cover
    })
    return callback({
      status: 'success',
      message: '',
      PostId: post.id
    })
  },

  putPost: async (req, res, callback) => {
    console.log(req.body)
    const post = await Post.findByPk(req.params.id)
    if (+req.params.id !== req.user.id) {
      return callback({
        status: 'error',
        message: 'can not edit because you are not author!!',
        PostId: post.id
      })
    }
    await post.update({
      title: req.body.title,
      content: req.body.content
    })
    return callback({
      status: 'success',
      message: '',
      PostId: post.id
    })
  },

  deletePost: async (req, res, callback) => {
    await Post.destroy({
      where: {
        id: req.params.id,
        UserId: req.user.id
      }
    })
    return callback({
      status: 'success',
      message: '',
      UserId: req.user.id
    })
  }
}

module.exports = postService
