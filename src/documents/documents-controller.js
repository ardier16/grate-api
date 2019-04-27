import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer'

import documents from './documents'

const upload = multer({ dest: 'uploads/' })
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newDocument = await documents.create({
      url: req.file.path,
      createdAt: new Date(),
    })

    res.status(200).send(newDocument)
  } catch (e) {
    res.status(500)
      .send('There was a problem adding the information to the database.')
  }
})

export default router
