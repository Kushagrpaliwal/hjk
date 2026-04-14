import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;
    globalThis.io = io;

    io.on("connection", (socket) => {
      socket.on("disconnect", () => {});
    });
  }

  res.end();
}
