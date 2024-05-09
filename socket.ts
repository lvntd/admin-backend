import { Server } from 'socket.io'

let io: Server

const socketIo = {
  init: (httpServer: any, options: any) => {
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
