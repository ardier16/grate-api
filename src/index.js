import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

import config from './config'

import UsersController from './modules/users/users-controller'
import PostsController from './modules/posts/posts-controller'
import AuthController from './modules/auth/auth-controller'
import DocumentsController from './modules/documents/documents-controller'
import FilesController from './modules/files/files-controller'
import FriendsController from './modules/friends/friends-controller'
import FactorsController from './modules/factors/factors-controller'

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
app.use('/posts', PostsController)
app.use('/auth', AuthController)
app.use('/documents', DocumentsController)
app.use('/friends', FriendsController)
app.use('/factors', FactorsController)

app.use('/uploads', FilesController)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Running gRate on port ${port}. DB state: ${db.readyState}`)
})
