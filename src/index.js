import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

import routes from './api-routes'
import config from './config'

import UsersController from './users/users-controller'

const app = express()

app.use(bodyParser.urlencoded({
  extended: true,
}))
app.use(bodyParser.json())

mongoose.connect(config.dbConnectionString, {
  useNewUrlParser: true,
})

const db = mongoose.connection
const port = process.env.PORT || config.port

app.use('/', routes)
app.use('/users', UsersController)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Running gRate on port ${port}. DB state: ${db.readyState}`)
})