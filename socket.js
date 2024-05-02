const { Server } = require('socket.io')

let io

module.exports = {
  init: (httpServer, options) => {
    io = new Server(httpServer, options)

    return io
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized')
    }
    return io
  },
}
