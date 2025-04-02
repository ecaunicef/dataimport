const express = require('express');
const {
  createBlog,
  updateBlog,
  deleteBlog,
  sendNotification,
  sendManually
} = require('../controller/blogController.js');

const router = express.Router();

router.post('/create-blogs', createBlog);
router.post('/update-blog', updateBlog);
router.post('/delete-blog', deleteBlog);
router.get('/send', sendNotification);
router.post('/send-manually', sendManually);


module.exports = router;
