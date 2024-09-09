const socket = require("socket.io");

instance = null;
class Socket {
  #socket = null;
  constructor() {
    if (instance) {
      throw new Error("Socket instance already exists");
    }
  }
  establishSocket(http) {
    this.#socket = socket(http, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket"],
        credentials: true,
      },
      allowEIO3: true,
    });
  }
  addMiddleware(middleware) {
    if (!this.#socket) {
      throw new Error("Socket not initialized");
    }
    this.#socket.use(middleware);
  }
  addEvent(event, callback) {
    if (!this.#socket) {
      throw new Error("Socket not initialized");
    }
    this.#socket.on(event, callback);
  }
  emitEvent(to = null, event, data) {
    if (!this.#socket) {
      throw new Error("Socket not initialized");
    }
    if (to) {
      this.#socket.to(to).emit(event, data);
    } else {
      this.#socket.emit(event, data);
    }
  }
}

const socketInstance = Object.freeze(new Socket());

module.exports = { socketInstance };
