import express from 'express'
import bodyParser from 'body-parser'
import users from './users'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', (req, res) => {
  users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.passwordHash,
  },
  (err, user) => {
    if (err) {
      res.status(500)
        .send('There was a problem adding the information to the database.')
    } else {
      res.status(200).send(user)
    }
  })
})

router.get('/', (req, res) => {
  users.find({}, (err, users) => {
    if (err) {
      res.status(500).send('There was a problem finding the users.')
    } else {
      res.status(200).send(users)
    }
  })
})

router.get('/:id', (req, res) => {
  users.findById(req.params.id, (err, user) => {
    if (err) {
      res.status(500).send('There was a problem finding the user.')
    } else if (!user) {
      res.status(404).send('No user found.')
    } else {
      res.status(200).send(user)
    }
  })
})

export default router
