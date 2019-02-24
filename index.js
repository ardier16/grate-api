let express = require('express')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
let app = express()
let apiRoutes = require("./api-routes")

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/grate', {
  useNewUrlParser: true,
})
let db = mongoose.connection;

let port = process.env.PORT || 8080

app.use('/', apiRoutes)

app.listen(port, function () {
  console.log("Running gRate on port " + port)
})
