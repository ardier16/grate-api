import jwt from 'jsonwebtoken'
import config from '../config'

import profiles from '../profiles/profiles'

export async function verifyToken (req, res, next) {
  const token = req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({ message: 'No token provided.' })
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Wrong token.' })
    }

    const profile = await profiles.findOne({ userId: decoded.id })

    if (profile) {
      await profiles.updateOne({ _id: profile._id }, {
        lastSeen: new Date(),
      })
    }

    req.userId = decoded.id
    next()
  })
}
