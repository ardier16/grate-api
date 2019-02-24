const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const apiRoutes = require('./api-routes')
const config = require('./config')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());

mongoose.connect(config.dbConnectionString, {
  useNewUrlParser: true,
})

const db = mongoose.connection
const port = process.env.PORT || config.port

app.use('/', apiRoutes)

app.listen(port, function () {
  console.log(`Running gRate on port ${port}`)
})
