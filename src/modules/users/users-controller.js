import express from 'express'
import bodyParser from 'body-parser'

import jwt from 'jsonwebtoken'
import config from '../../config'
import { verifyToken } from '../auth/verify-token'

import { CryptoUtil } from '../../utils/crypto.util'

import users from './users'
import { RESPONSE_CODES } from '../../const/response-codes'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', async (req, res) => {
  try {
    const userByEmail = await users.findOne({ email: req.body.email })
    const userByLogin = await users.findOne({ login: req.body.login })

    if (userByEmail) {
      return res.status(RESPONSE_CODES.conflict)
        .send('User with such email already exists')
    }

    if (userByLogin) {
      return res.status(RESPONSE_CODES.conflict)
        .send('User with such login already exists')
    }

    const passwordHash = CryptoUtil.sha256(req.body.password)

    const newUser = await users.create({
      login: req.body.login,
      email: req.body.email,
      passwordHash,
      name: '',
      status: '',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date(),
    })

    const expiresIn = 86400
    const token = jwt.sign({ id: newUser._id }, config.secret, {
      expiresIn,
    })

    res.status(RESPONSE_CODES.created).send({
      id: newUser._id,
      token,
      expiresIn,
    })
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await users.find({})
    res.status(RESPONSE_CODES.success).send(data.map(user => {
      return {
        id: user._id,
        login: user.login,
        email: user.email,
        name: user.name,
        birthDate: user.birthDate,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    }))
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the users.')
  }
})

router.get('/search', async (req, res) => {
  try {
    const data = await users.find({
      $text: { $search: req.query.q },
    })
    res.status(RESPONSE_CODES.success).send(data.map(user => {
      return {
        id: user._id,
        login: user.login,
        email: user.email,
        name: user.name,
        birthDate: user.birthDate,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    }))
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the users.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await users.findById(req.params.id)

    if (user) {
      res.status(RESPONSE_CODES.success).send({
        id: user._id,
        login: user.login,
        email: user.email,
        name: user.name,
        birthDate: user.birthDate,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    } else {
      res.status(RESPONSE_CODES.badRequest).send('No user found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the user.')
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const user = await users.findById(req.params.id)

    if (user) {
      await users.updateOne({ _id: user._id }, {
        name: req.body.name || user.name,
        birthDate: req.body.birthDate || user.birthDate,
        avatarUrl: req.body.avatarUrl || user.avatarUrl,
        status: req.body.status || user.status,
        updatedAt: new Date(),
      })

      const newUser = await users.findById(req.params.id)

      res.status(RESPONSE_CODES.success).send({
        id: newUser._id,
        login: newUser.login,
        email: newUser.email,
        name: newUser.name,
        birthDate: newUser.birthDate,
        avatarUrl: newUser.avatarUrl,
        status: newUser.status,
        lastSeen: newUser.lastSeen,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      })
    } else {
      res.status(RESPONSE_CODES.notFound).send('No user found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the user.')
  }
})

export default router
