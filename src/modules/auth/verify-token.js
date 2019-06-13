import jwt from 'jsonwebtoken'
import config from '../../config'

import users from '../users/users'

export async function verifyToken (req, res, next) {
  const token = req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({ message: 'No token provided.' })
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Wrong token.' })
    }

    const user = await users.findOne({ _id: decoded.id })

    if (user) {
      await users.updateOne({ _id: user._id }, {
        lastSeen: new Date(),
      })
    }

    req.userId = decoded.id
    next()
  })
}
