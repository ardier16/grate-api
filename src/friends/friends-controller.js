import express from 'express'
import bodyParser from 'body-parser'

import { verifyToken } from '../auth/verify-token'

import friends from './friends'
import users from '../users/users'

import { REQUEST_STATES } from '../const/request-states'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/request', verifyToken, async (req, res) => {
  try {
    const friendRequest = await friends.findOne({
      state: REQUEST_STATES.pending,
      $or: [
        {
          $and: [
            { ownerId: req.userId },
            { participantId: req.body.participantId },
          ],
        },
        {
          $and: [
            { ownerId: req.body.participantId },
            { participantId: req.userId },
          ],
        },
      ],
    })

    if (friendRequest) {
      res.status(409).send('This request already exists')
    } else {
      const newFriendRequest = await friends.create({
        participantId: req.body.participantId,
        state: REQUEST_STATES.pending,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: req.userId,
      })

      res.status(200).send(newFriendRequest)
    }
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
      friendRequest.participantId.toString() === req.userId

    if (isRequestValid) {
      await friends.updateOne({ _id: friendRequest._id }, {
        state: REQUEST_STATES.rejected,
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
      .map(f => {
        return f.ownerId.toString() === req.userId
          ? f.participantId
          : f.ownerId
      })

    const friendUsers = await users.where('_id').in(friendsIds)

    res.status(200).send(friendUsers.map(user => {
      return {
        id: user._id,
        login: user.login,
        email: user.email,
        name: user.name,
        birthDate: user.birthDate,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastSeen: user.lastSeen,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the requests.')
  }
})

router.get('/received', verifyToken, async (req, res) => {
  try {
    const participatedRequests = await friends.find({
      state: REQUEST_STATES.pending,
      participantId: req.userId,
    })

    res.status(200).send(participatedRequests.map(request => {
      return {
        id: request._id,
        ownerId: request.ownerId,
        participantId: request.participantId,
        state: request.state,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the requests.')
  }
})

router.get('/sent', verifyToken, async (req, res) => {
  try {
    const ownedRequests = await friends.find({
      state: REQUEST_STATES.pending,
      ownerId: req.userId,
    })

    res.status(200).send(ownedRequests.map(request => {
      return {
        id: request._id,
        ownerId: request.ownerId,
        participantId: request.participantId,
        state: request.state,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the requests.')
  }
})

export default router
