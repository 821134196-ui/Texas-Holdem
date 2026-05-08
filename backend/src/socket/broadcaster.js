class Broadcaster {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
  }

  emitToSelf(event, payload) {
    this.socket.emit(event, payload);
  }

  emitToRoom(room, event, payload, includeSelf = true) {
    if (includeSelf) {
      this.io.to(room).emit(event, payload);
    } else {
      this.socket.to(room).emit(event, payload);
    }
  }

  emitToTable(tableId, event, payload, includeSelf = true) {
    const room = `table:${tableId}`;
    this.emitToRoom(room, event, payload, includeSelf);
  }

  emitToLobby(event, payload) {
    this.io.to('lobby').emit(event, payload);
  }

  emitToUserId(userId, event, payload) {
    const targetSocket = this.findSocketByUserId(userId);
    if (targetSocket) {
      targetSocket.emit(event, payload);
    }
  }

  async forEachClientInTable(tableId, callback) {
    const room = `table:${tableId}`;
    const clients = await this.io.in(room).allSockets();
    
    for (const clientId of clients) {
      const clientSocket = this.io.sockets.sockets.get(clientId);
      if (clientSocket && clientSocket.user) {
        callback(clientSocket);
      }
    }
  }

  findSocketByUserId(userId) {
    for (const [id, socket] of this.io.sockets.sockets) {
      if (socket.user && socket.user.id === userId) {
        return socket;
      }
    }
    return null;
  }

  async getRoomClients(room) {
    return await this.io.in(room).allSockets();
  }
}

module.exports = { Broadcaster };
