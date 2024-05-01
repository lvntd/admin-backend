const express = require('express')
const projectsController = require('../controllers/projects.controller')
const { requireAuth } = require('../middleware/auth.middleware')

const router = express.Router()

router.post('/', requireAuth, projectsController.createProject)

module.exports = router
