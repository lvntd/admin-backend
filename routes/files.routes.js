const express = require('express')
const filesController = require('../controllers/files.controller')

const router = express.Router()

router.post('/', filesController.uploadFile)
router.delete('/', filesController.deleteFile)

module.exports = router
