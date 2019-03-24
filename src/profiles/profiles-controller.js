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
      userId: req.body.userId,
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
        userId: profile.userId,
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
        userId: profile.userId,
      })
    } else {
      res.status(404).send('No profile found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the profile.')
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const profile = await profiles.findById(req.params.id)

    if (profile) {
      await profiles.updateOne({ _id: profile._id }, {
        name: req.body.name || profile.name,
        birthDate: req.body.birthDate || profile.birthDate,
        avatarUrl: req.body.avatarUrl || profile.avatarUrl,
        status: req.body.status || profile.status,
      })

      const newProfile = await profiles.findById(req.params.id)

      res.status(200).send({
        _id: newProfile._id,
        name: newProfile.name,
        birthDate: newProfile.birthDate,
        avatarUrl: newProfile.avatarUrl,
        status: newProfile.status,
        userId: newProfile.userId,
      })
    } else {
      res.status(404).send('No profile found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the profile.')
  }
})

export default router
