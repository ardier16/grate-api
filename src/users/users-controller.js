import express from 'express'
import bodyParser from 'body-parser'
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

    const newUser = await users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.passwordHash,
      createdAt: Date.now(),
    })

    res.status(200).send(newUser)
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/', async (req, res) => {
  try {
    const data = await users.find({})
    res.status(200).send(data)
  } catch (e) {
    res.status(500).send('There was a problem finding the users.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = users.findById(req.params.id)

    if (user) {
      res.status(200).send(user)
    } else {
      res.status(404).send('No user found.')
    }
  } catch (e) {
    res.status(500).send('There was a problem finding the user.')
  }
})

export default router
