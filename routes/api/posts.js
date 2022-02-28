const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route POST /api/posts
// @desc Add Post
// @access Private

router.post(
  '/',
  [auth, [check('text', 'Text description is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route GET /api/posts
// @desc Get all post
// @access Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/post/:id
// @desc Get post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});

// @route DELETE /api/posts/:id
// @desc Delete Post
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (req.user.id !== post.user.toString()) {
      return res.status(401).json({ msg: 'User not authorized.' });
    }

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    await post.remove();

    return res.send(`Post removed. \n ${post}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Checking if post is already been liked.
    if (
      post.like.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked.' });
    }
    post.like.unshift({ user: req.user.id });
    await post.save();
    res.json(post.like);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// route PUT api/posts/unlike/:id
// desc Unlike a post
// access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.like.filter(like => like.user.toString() === req.user.id) === 0) {
      return res
        .status(400)
        .json({ msg: 'Post should be liked before unliking.' });
    }

    const removeIndex = post.like
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.like.splice(removeIndex, 1);

    await post.save();

    res.json(post.like);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// route POST api/posts/comment/:id
// desc Add a comment in a post
// access Private

router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required.').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ msg: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.user.id).select('-password');

      const newComment = {
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
      };

      post.comment.unshift(newComment);

      await post.save();
      res.json(post.comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// route DELETE api/posts/comment/:id/:comment_id
// desc Delete a comment
// access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = post.comment.find(
      comment => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized.' });
    }

    const removeIndex = post.comment
      .map(comment => comment.id.toString())
      .indexOf(req.user.id);

    post.comment.splice(removeIndex, 1);

    await post.save();

    res.json(post.comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
