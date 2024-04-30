const { unlink } = require('fs')

const deleteFile = (filePath, callback) => {
  unlink(filePath, callback)
}

exports.deleteFile = deleteFile
