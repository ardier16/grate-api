import express from 'express'
import bodyParser from 'body-parser'

import jwt from 'jsonwebtoken'
import config from '../config'

import users from '../users/users'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.post('/', async (req, res) => {
  try {
    const userByEmail = await users.findOne({ email: req.body.email })
    const userByName = await users.findOne({ name: req.body.login })
    const user = userByEmail || userByName

    if (!user) {
      return res.status(404).send('Not found')
    }

    if (req.body.passwordHash === user.passwordHash) {
      const expiresIn = 86400
      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn,
      })

      res.status(200).send({ token, expiresIn })
    } else {
      return res.status(401).send('Unauthorized')
    }
  } catch (e) {
    res.status(500).send('Internal server error')
  }
})

export default router
