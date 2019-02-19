let router = require('express').Router()

router.get('/', function (req, res) {
  res.json({
    status: 'API Is Working',
    message: 'Welcome to gRate crafted with love!',
  })
})

module.exports = router