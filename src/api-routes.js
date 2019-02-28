let router = require('express').Router()

router.get('/', function (req, res) {
  res.json({
    status: 'API Is Working',
    message: 'Welcome to gRate crafted with love!',
  })
})

router.post('/sign-in', function (req, res) {
  res.json({
    path: 'sign-in',
    method: 'POST',
  })
})

router.post('/sign-up', function (req, res) {
  res.json({
    path: 'sign-up',
    method: 'POST',
  })
})

router.get('/posts', function (req, res) {
  res.json({
    path: 'posts',
    method: 'GET',
  })
})

router.post('/posts', function (req, res) {
  res.json({
    path: 'posts',
    method: 'POST',
  })
})

module.exports = router
