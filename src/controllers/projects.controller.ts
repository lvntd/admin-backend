import { validationResult } from 'express-validator'
import { Project, Client, User } from '../models/index.js'
import mongoose from 'mongoose'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'
import { Request, Response, NextFunction } from 'express'

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const newProject = new Project(req.body)

  try {
    const project = await newProject.save()
    const client = await Client.findById(req.body.client)

    const userIds = req.body.projectTeam.members.map(
      (memberId: string) => new mongoose.Types.ObjectId(memberId),
    )
    const users = await User.find({ _id: { $in: userIds } })

    users.forEach((user) => {
      user.projects.push(project._id)
      user.save()
    })

    if (client) {
      client.projects.push(project._id)
      client.save()
    }

    // @ts-ignore
    serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, project)
  } catch (err) {
    // Check to ensure no response has been sent
    if (!res.headersSent) {
      return next(err)
    }
  }
}
