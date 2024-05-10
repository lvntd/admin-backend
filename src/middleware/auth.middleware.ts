import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const jwtSecret = process.env.JWT_SECRET || 'xyz890'

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.accessToken || req.headers.authorization

  if (token) {
    jwt.verify(token, jwtSecret, (err: unknown, decodedToken: any) => {
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
