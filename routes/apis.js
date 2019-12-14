const express = require('express')
const router = express.Router()

const postController = require('../controllers/apis/postController')

router.get('/', (req, res) => res.redirect('/apis/posts'))
router.get('/posts', postController.getPosts)

module.exports = router
