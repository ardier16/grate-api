import express from 'express'
import bodyParser from 'body-parser'

import { verifyToken } from '../auth/verify-token'
import posts from './posts'
import users from '../users/users'
import friends from '../friends/friends'
import { REQUEST_STATES } from '../const/request-states'
import comments from './comments'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', verifyToken, async (req, res) => {
  try {
    const newPost = await posts.create({
      title: req.body.title,
      text: req.body.text,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: req.userId,
    })

    res.status(200).send(newPost)
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/', async (req, res) => {
  try {
    const availablePosts = await posts.find({})
    const authors = await users.where('_id').in(
      availablePosts.map(p => p.ownerId)
    )

    const result = availablePosts
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(async post => {
        const author = authors
          .find(a => a._id.toString() === post.ownerId.toString())
        const postComments = await comments.find({
          postId: post._id,
        })

        return {
          id: post._id,
          title: post.title,
          text: post.text,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: {
            id: author._id,
            name: author.name,
            login: author.login,
            avatarUrl: author.avatarUrl,
          },
          commentsCount: postComments.length,
        }
      })

    res.status(200).send(await Promise.all(result))
  } catch (e) {
    res.status(500).send('There was a problem finding the posts.')
  }
})

router.get('/feed', verifyToken, async (req, res) => {
  try {
    const ownedRequests = await friends.find({
      state: REQUEST_STATES.approved,
      ownerId: req.userId,
    })
    const participatedRequests = await friends.find({
      state: REQUEST_STATES.approved,
      participantId: req.userId,
    })

    const friendsIds = ownedRequests
      .concat(participatedRequests)
      .map(f => {
        return f.ownerId.toString() === req.userId
          ? f.participantId
          : f.ownerId
      })

    const availablePosts = await posts.where('ownerId').in([
      req.userId,
      ...friendsIds,
    ])
    const authors = await users.where('_id').in(
      availablePosts.map(p => p.ownerId)
    )

    const result = availablePosts
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(async post => {
        const author = authors
          .find(a => a._id.toString() === post.ownerId.toString())
        const postComments = await comments.find({
          postId: post._id,
        })

        return {
          id: post._id,
          title: post.title,
          text: post.text,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: {
            id: author._id,
            name: author.name,
            login: author.login,
            avatarUrl: author.avatarUrl,
          },
          commentsCount: postComments.length,
        }
      })

    res.status(200).send(await Promise.all(result))
  } catch (e) {
    res.status(500).send('There was a problem finding the posts.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      const author = await users.findOne({
        _id: post.ownerId,
      })
      const postComments = await comments.find({
        postId: post._id,
      })
      const commentAuthors = await users.where('_id').in(
        postComments.map(p => p.ownerId)
      )

      res.status(200).send({
        id: post._id,
        title: post.title,
        text: post.text,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          id: author._id,
          name: author.name,
          login: author.login,
          avatarUrl: author.avatarUrl,
        },
        comments: postComments.map(comment => ({
          id: comment._id,
          author: commentAuthors
            .filter(a => a._id.toString() === comment.ownerId.toString())
            .map(author => ({
              id: author._id,
              name: author.name,
              login: author.login,
              avatarUrl: author.avatarUrl,
            }))[0],
          text: comment.text,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        })),
      })
    } else {
      res.status(404).send('No post found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the post.')
  }
})

router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      const newComment = await comments.create({
        text: req.body.text,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: req.userId,
        postId: post._id,
      })

      res.status(201).send(newComment)
    } else {
      res.status(404).send('No post found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the post.')
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      if (post.ownerId.toString() === req.userId) {
        await posts.updateOne({ _id: post._id }, {
          title: req.body.title || post.title,
          text: req.body.text || post.text,
          updatedAt: new Date(),
        })

        const updatedPost = await posts.findById(req.params.id)

        res.status(200).send({
          id: updatedPost._id,
          title: updatedPost.title,
          text: updatedPost.text,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
          ownerId: updatedPost.ownerId,
        })
      } else {
        res.status(401).send('The post can be updated only by owner.')
      }
    } else {
      res.status(404).send('No post found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the post.')
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      if (post.ownerId.toString() === req.userId) {
        await posts.findByIdAndDelete(req.params.id)

        res.status(200).send('The post was successfully removed')
      } else {
        res.status(401).send('The post can be deleted only by owner.')
      }
    } else {
      res.status(404).send('No post found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the post.')
  }
})

router.put('/comments/:id', verifyToken, async (req, res) => {
  try {
    const comment = await comments.findById(req.params.id)

    if (comment) {
      if (comment.ownerId.toString() === req.userId) {
        await comments.updateOne({ _id: comment._id }, {
          text: req.body.text || comment.text,
          updatedAt: new Date(),
        })

        res.status(204).send({})
      } else {
        res.status(401).send('The comment can be updated only by owner.')
      }
    } else {
      res.status(404).send('No comment found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the comment.')
  }
})

router.delete('/comments/:id', verifyToken, async (req, res) => {
  try {
    const comment = await comments.findById(req.params.id)

    if (comment) {
      if (comment.ownerId.toString() === req.userId) {
        await comments.findByIdAndDelete(req.params.id)

        res.status(204).send({})
      } else {
        res.status(401).send('The comment can be deleted only by owner.')
      }
    } else {
      res.status(404).send('No comment found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the comment.')
  }
})

export default router
