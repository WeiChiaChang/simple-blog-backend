const db = require('../models')
const Post = db.Post
const Clap = db.Clap
const replyService = require('../services/replyService')

const replyController = {
  getReplies: (req, res) => {
    replyService.getReplies(req, res, data => {
      return res.render('post/reply', data)
    })
  },
  postReply: (req, res) => {
    replyService.postReply(req, res, data => {
      return res.redirect(`/posts/${data['PostId']}/replies`)
    })
  },
  deleteReply: (req, res) => {
    replyService.deleteReply(req, res, data => {
      return res.redirect(`/posts/${data['PostId']}/replies`)
    })
  },

  clap: (req, res) => {
    return Clap.findOne({
      where: { UserId: req.user.id, PostId: +req.params.id }
    }).then(clap => {
      if (clap) {
        clap
          .update({
            clap: +(clap.clap + 1)
          })
          .then(() => {
            res.redirect('back')
          })
      } else {
        Clap.create({
          clap: 1,
          UserId: req.user.id,
          PostId: req.params.id
        }).then(() => {
          res.redirect('back')
        })
      }
    })
  },

  unClap: (req, res) => {
    return res.send('POST 撤回一次鼓掌')
  },

  addBookmark: (req, res) => {
    return res.send('POST 新增一個書籤')
  },

  deleteBookmark: (req, res) => {
    return res.send('DELETE 刪除一個書籤')
  }
}

module.exports = replyController
