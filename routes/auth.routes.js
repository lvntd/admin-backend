const express = require('express')
const authController = require('../controllers/auth.controller')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/me', authController.me)

module.exports = router
