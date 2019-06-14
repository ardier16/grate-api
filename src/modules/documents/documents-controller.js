import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer'

import documents from './documents'
import { RESPONSE_CODES } from '../../const/response-codes'

const upload = multer({ dest: 'uploads/' })
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newDocument = await documents.create({
      path: req.file.path,
      createdAt: new Date(),
    })

    res.status(RESPONSE_CODES.success).send({
      id: newDocument._id,
      path: newDocument.path,
      createdAt: newDocument.createdAt,
    })
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem adding the information to the database.')
  }
})

router.get('/:id', async (req, res) => {
  try {
    const document = await documents.findById(req.params.id)

    if (document) {
      res.status(RESPONSE_CODES.success).send({
        id: document._id,
        path: document.path,
        createdAt: document.createdAt,
      })
    } else {
      res.status(RESPONSE_CODES.notFound).send('No post found.')
    }
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the post.')
  }
})

export default router
