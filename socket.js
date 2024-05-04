import { Server } from 'socket.io'

let io

const socketIo = {
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

export default socketIo
