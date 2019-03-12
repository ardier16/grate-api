import express from 'express'
import bodyParser from 'body-parser'

import jwt from 'jsonwebtoken'
import config from '../config'

import users from '../users/users'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.post('/auth', async (req, res) => {
  try {
    const userByEmail = await users.findOne({ email: req.body.email })

    if (userByEmail) {
      return res.status(404).send('Not found')
    }

    if (req.body.passwordHash !== userByEmail.passwordHash) {
      return res.status(401).send('Unauthorized')
    }

    const token = jwt.sign({ id: userByEmail._id }, config.secret, {
      expiresIn: 86400,
    })

    res.status(200).send({ token })
  } catch (e) {
    res.status(500).send('Internal server error')
  }
})
