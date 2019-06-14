import express from 'express'
import bodyParser from 'body-parser'

import factors from './factors'
import { RESPONSE_CODES } from '../../const/response-codes'

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }))

router.get('/', async (req, res) => {
  try {
    let query = {}

    if (req.query.type) {
      query.type = Number(req.query.type)
    }

    if (req.query.locale) {
      query.locale = req.query.locale
    }

    const foundFactors = await factors.find(query)

    res.status(RESPONSE_CODES.success)
      .send(foundFactors.map(factor => {
        return {
          id: factor._id,
          name: factor.name,
          locale: factor.locale,
          type: factor.type,
          code: factor.code,
        }
      }))
  } catch (e) {
    res.status(RESPONSE_CODES.internalServerError)
      .send('There was a problem finding the requests.')
  }
})

export default router
