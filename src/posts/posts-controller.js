import express from 'express'
import bodyParser from 'body-parser'

import { verifyToken } from '../auth/verify-token'
import posts from './posts'

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
    const data = await posts.find({})
    res.status(200).send(data.map(post => {
      return {
        _id: post._id,
        title: post.title,
        text: post.text,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        ownerId: post.ownerId,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the posts.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const post = await posts.findById(req.params.id)

    if (post) {
      res.status(200).send({
        _id: post._id,
        title: post.title,
        text: post.text,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        ownerId: post.ownerId,
      })
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
          _id: updatedPost._id,
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
        await posts.findByIdAndRemove(req.params.id)

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

export default router