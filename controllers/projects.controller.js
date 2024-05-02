const { validationResult } = require('express-validator')
const Project = require('../models/project.model')
const Client = require('../models/client.model')
const User = require('../models/user.model')
const mongoose = require('mongoose')

exports.createProject = async (req, res, next) => {
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
      (memberId) => new mongoose.Types.ObjectId(memberId),
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
    res
      .status(201)
      .json({ message: 'project created successfully', data: project })
  } catch (err) {
    // Check to ensure no response has been sent
    if (!res.headersSent) {
      const error = new Error(err)
      error.message = 'Could not create project'
      return next(error)
    }
  }
}
