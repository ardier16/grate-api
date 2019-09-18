import express from 'express'
import bodyParser from 'body-parser'

import { verifyToken } from '../auth/verify-token'

import posts from './posts'
import users from '../users/users'
import friends from '../friends/friends'
import comments from './comments'
import postRates from './post-rates'
import factors from '../factors/factors'

import { REQUEST_STATES } from '../../const/request-states'
import { RESPONSE_CODES } from '../../const/response-codes'

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

    res.status(RESPONSE_CODES.created).send(newPost)
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
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
        const rates = await postRates.find({
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
          ratesCount: rates.length,
        }
      })

    res.status(RESPONSE_CODES.success).send(await Promise.all(result))
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the posts.')
  }
})

router.get('/search', async (req, res) => {
  try {
    const availablePosts = await posts.find({
      $text: { $search: req.query.q },
    })

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
        const rates = await postRates.find({
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
          ratesCount: rates.length,
        }
      })

    res.status(RESPONSE_CODES.success).send(await Promise.all(result))
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the posts.')
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
        const rates = await postRates.find({
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
          ratesCount: rates.length,
        }
      })

    res.status(RESPONSE_CODES.success)
      .send(await Promise.all(result))
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the posts.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      const author = await users.findOne({
        _id: post.ownerId,
      })
      const rates = await postRates.find({
        postId: post._id,
      })
      const postComments = await comments.find({
        postId: post._id,
      })
      const commentAuthors = await users.where('_id').in(
        postComments.map(p => p.ownerId)
      )

      res.status(RESPONSE_CODES.success).send({
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
        rates: rates.map(rate => ({
          id: rate._id,
          value: rate.value,
          factorId: rate.factorId,
          ownerId: rate.ownerId,
          createdAt: rate.createdAt,
          updatedAt: rate.updatedAt,
        })),
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
      res.status(RESPONSE_CODES.notFound).send('No post found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the post.')
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

      res.status(RESPONSE_CODES.created).send(newComment)
    } else {
      res.status(RESPONSE_CODES.notFound).send('No post found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the post.')
  }
})

router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)
    const factor = await factors.findOne({
      code: req.body.factorCode,
    })

    if (post && factor) {
      const postRate = await postRates.findOne({
        ownerId: req.userId,
        postId: post._id,
        factorId: factor._id,
      })

      if (postRate) {
        await postRates.updateOne({ _id: postRate._id }, {
          value: req.body.value,
          updatedAt: new Date(),
        })

        res.status(RESPONSE_CODES.noContent).send({})
      } else {
        const newPostRate = await postRates.create({
          value: req.body.value,
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: req.userId,
          postId: post._id,
          factorId: factor._id,
        })

        res.status(RESPONSE_CODES.created).send(newPostRate)
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No post or factor found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem adding the rate.')
  }
})

router.put('/rates/:id', verifyToken, async (req, res) => {
  try {
    const rate = await postRates.findById(req.params.id)

    if (rate) {
      if (rate.ownerId.toString() === req.userId) {
        await postRates.updateOne({ _id: rate._id }, {
          value: req.body.value || rate.value,
          updatedAt: new Date(),
        })

        res.status(RESPONSE_CODES.noContent).send({})
      } else {
        res.status(RESPONSE_CODES.unauthorized)
          .send('The rate can be updated only by owner.')
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No rate found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the rate.')
  }
})

router.delete('/rates/:id', verifyToken, async (req, res) => {
  try {
    const rate = await postRates.findById(req.params.id)

    if (rate) {
      if (rate.ownerId.toString() === req.userId) {
        await postRates.findByIdAndDelete(req.params.id)

        res.status(RESPONSE_CODES.noContent).send({})
      } else {
        res.status(RESPONSE_CODES.unauthorized)
          .send('The rate can be deleted only by owner.')
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No rate found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the rate.')
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

        res.status(RESPONSE_CODES.success).send({
          id: updatedPost._id,
          title: updatedPost.title,
          text: updatedPost.text,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
          ownerId: updatedPost.ownerId,
        })
      } else {
        res.status(RESPONSE_CODES.unauthorized)
          .send('The post can be updated only by owner.')
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No post found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the post.')
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      if (post.ownerId.toString() === req.userId) {
        await posts.findByIdAndDelete(req.params.id)

        res.status(RESPONSE_CODES.noContent).send({})
      } else {
        res.status(RESPONSE_CODES.unauthorized)
          .send('The post can be deleted only by owner.')
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No post found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the post.')
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

        res.status(RESPONSE_CODES.noContent).send({})
      } else {
        res.status(RESPONSE_CODES.unauthorized)
          .send('The comment can be updated only by owner.')
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No comment found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the comment.')
  }
})

router.delete('/comments/:id', verifyToken, async (req, res) => {
  try {
    const comment = await comments.findById(req.params.id)

    if (comment) {
      if (comment.ownerId.toString() === req.userId) {
        await comments.findByIdAndDelete(req.params.id)

        res.status(RESPONSE_CODES.noContent).send({})
      } else {
        res.status(RESPONSE_CODES.unauthorized)
          .send('The comment can be deleted only by owner.')
      }
    } else {
      res.status(RESPONSE_CODES.notFound).send('No comment found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the comment.')
  }
})

export default router
