import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.get('/:id', async (req, res) => {
  const fileUrl = path.resolve(`uploads/${req.params.id}`)
  res.download(fileUrl, _ => {
    res.end('No upload found')
  })
})

export default router
