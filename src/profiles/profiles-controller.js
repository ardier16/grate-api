import express from 'express'
import bodyParser from 'body-parser'

import { verifyToken } from '../auth/verify-token'
import profiles from './profiles'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', verifyToken, async (req, res) => {
  try {
    const profileByUserId = await profiles.findOne({ userId: req.body.userId })

    if (profileByUserId) {
      return res.status(400).send('Profile with such user ID already exists')
    }

    const newUser = await profiles.create({
      name: req.body.name,
      birthDate: req.body.birthDate,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
    })

    res.status(200).send(newUser)
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await profiles.find({})
    res.status(200).send(data.map(profile => {
      return {
        _id: profile._id,
        name: profile.name,
        birthDate: profile.birthDate,
        avatarUrl: profile.avatarUrl,
        status: profile.status,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the users.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const profile = await profiles.findById(req.params.id)

    if (profile) {
      res.status(200).send({
        _id: profile._id,
        name: profile.name,
        birthDate: profile.birthDate,
        avatarUrl: profile.avatarUrl,
        status: profile.status,
      })
    } else {
      res.status(404).send('No profile found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the profile.')
  }
})

export default router
