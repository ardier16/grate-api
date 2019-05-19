import express from 'express'
import bodyParser from 'body-parser'

import jwt from 'jsonwebtoken'
import config from '../config'

import { CryptoUtil } from '../utils/crypto.util'

import users from './users'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', async (req, res) => {
  try {
    const userByEmail = await users.findOne({ email: req.body.email })
    const userByName = await users.findOne({ name: req.body.name })

    if (userByEmail) {
      return res.status(400).send('User with such email already exists')
    }

    if (userByName) {
      return res.status(400).send('User with such name already exists')
    }

    const passwordHash = CryptoUtil.sha256(req.body.password)

    const newUser = await users.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash,
      createdAt: Date.now(),
    })

    const expiresIn = 86400
    const token = jwt.sign({ id: newUser._id }, config.secret, {
      expiresIn,
    })

    res.status(200).send({
      id: newUser._id,
      token,
      expiresIn,
    })
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await users.find({})
    res.status(200).send(data.map(user => {
      return {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    }))
  } catch (e) {
    res.status(500).send('There was a problem finding the users.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await users.findById(req.params.id)

    if (user) {
      res.status(200).send({
        id: user._id,
        name: user.name,
        email: user.email,
      })
    } else {
      res.status(404).send('No user found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the user.')
  }
})

export default router
