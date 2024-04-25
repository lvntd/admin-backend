const jwt = require('jsonwebtoken')

const requireAuth = (req, res, next) => {
  const token = req.cookies.accessToken

  console.log({ token })

  if (token) {
    jwt.verify(token, 'tediashvili secret', (err, decodedToken) => {
      if (err) {
        res.status(403).json({ message: 'Not logged in' })
      } else {
        console.log({ decodedToken })
        next()
      }
    })
    return
  }
  res.status(403).json({ message: 'Not logged in' })
}

module.exports = { requireAuth }
