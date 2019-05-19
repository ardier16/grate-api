import express from 'express'
import bodyParser from 'body-parser'

import { verifyToken } from '../auth/verify-token'

import friends from './friends'
import profiles from '../profiles/profiles'

import { REQUEST_STATES } from '../const/request-states'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/request', verifyToken, async (req, res) => {
  try {
    const newFriendRequest = await friends.create({
      participantId: req.body.participantId,
      state: REQUEST_STATES.pending,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: req.userId,
    })

    res.status(200).send(newFriendRequest)
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.post('/:id/approve', verifyToken, async (req, res) => {
  try {
    const friendRequest = await friends.findById(req.params.id)
    const isRequestValid = friendRequest &&
      friendRequest.state === REQUEST_STATES.pending &&
      friendRequest.participantId.toString() === req.userId

    if (isRequestValid) {
      await friends.updateOne({ _id: friendRequest._id }, {
        state: REQUEST_STATES.approved,
        updatedAt: new Date(),
      })

      res.status(204).send()
    } else {
      res.status(404).send('No request found.')
    }
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.post('/:id/reject', verifyToken, async (req, res) => {
  try {
    const friendRequest = await friends.findById(req.params.id)
    const isRequestValid = friendRequest &&
      friendRequest.state === REQUEST_STATES.pending &&
      friendRequest.participantId === req.userId

    if (isRequestValid) {
      await friends.updateOne({ _id: friendRequest._id }, {
        state: REQUEST_STATES.rejected,
        updatedAt: new Date(),
      })

      res.status(204)
    } else {
      res.status(404).send('No request found.')
    }
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/', verifyToken, async (req, res) => {
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
      .map(f => f.ownerId === req.userId ? f.participantId : f.ownerId)

    const friendProfiles = await profiles
      .where('userId').in(friendsIds)

    res.status(200).send(friendProfiles.map(profile => {
      return {
        id: profile._id,
        name: profile.name,
        birthDate: profile.birthDate,
        avatarUrl: profile.avatarUrl,
        status: profile.status,
        userId: profile.userId,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the posts.')
  }
})

// router.put('/:id', verifyToken, async (req, res) => {
//   try {
//     const post = await posts.findById(req.params.id)

//     if (post) {
//       if (post.ownerId.toString() === req.userId) {
//         await posts.updateOne({ _id: post._id }, {
//           title: req.body.title || post.title,
//           text: req.body.text || post.text,
//           updatedAt: new Date(),
//         })

//         const updatedPost = await posts.findById(req.params.id)

//         res.status(200).send({
//           id: updatedPost._id,
//           title: updatedPost.title,
//           text: updatedPost.text,
//           createdAt: updatedPost.createdAt,
//           updatedAt: updatedPost.updatedAt,
//           ownerId: updatedPost.ownerId,
//         })
//       } else {
//         res.status(401).send('The post can be updated only by owner.')
//       }
//     } else {
//       res.status(404).send('No post found.')
//     }
//   } catch (e) {
//     res.status(500).send('There was a problem finding the post.')
//   }
// })

// router.delete('/:id', verifyToken, async (req, res) => {
//   try {
//     const post = await posts.findById(req.params.id)

//     if (post) {
//       if (post.ownerId.toString() === req.userId) {
//         await posts.findByIdAndRemove(req.params.id)

//         res.status(200).send('The post was successfully removed')
//       } else {
//         res.status(401).send('The post can be deleted only by owner.')
//       }
//     } else {
//       res.status(404).send('No post found.')
//     }
//   } catch (e) {
//     res.status(500).send('There was a problem finding the post.')
//   }
// })

export default router
