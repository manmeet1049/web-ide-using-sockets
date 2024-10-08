const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");
const pty = require("node-pty");
const os = require("os");

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.cwd() + "/user",
  env: process.env,
});

const app = express();

const server = http.createServer(app);

const io = new SocketServer({
  cors: "*",
});
io.attach(server);

// emiting the data (eg: it can be reults of a command execution)
ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
  console.log(`socket connected with id ::> ${socket.id}`);

  // setting up terminal write socket logic, i.e whenever user writes something just write the same command to the pty terminal instance.
  socket.on("terminal:write", (data) => {
    console.log("Term", data);
    // ptyProcess.write(data + "\r");
    if (data.endsWith("\r")) {
      // If data ends with Enter (or '\r'), just write it directly
      ptyProcess.write(data);
    } else {
      // Otherwise, write the data without adding '\r' (until an Enter is detected)
      ptyProcess.write(data);
    }
  });
});

server.listen(9000, () => console.log(`🐋 server running on port 9000`));
