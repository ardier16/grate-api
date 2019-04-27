import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

import config from './config'

import UsersController from './users/users-controller'
import ProfilesController from './profiles/profiles-controller'
import PostsController from './posts/posts-controller'
import AuthController from './auth/auth-controller'

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true,
}))
app.use(bodyParser.json())

mongoose.connect(config.dbConnectionString, {
  useNewUrlParser: true,
})

const db = mongoose.connection
const port = process.env.PORT || config.port

app.use('/users', UsersController)
app.use('/profiles', ProfilesController)
app.use('/posts', PostsController)
app.use('/auth', AuthController)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Running gRate on port ${port}. DB state: ${db.readyState}`)
})
