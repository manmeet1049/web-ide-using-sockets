const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");
const pty = require("node-pty");
const os = require("os");
const fs = require("fs/promises");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");

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
app.use(cors());

io.attach(server);

chokidar.watch("./user").on("all", (event, path) => {
  io.emit("file:refresh", path);
});

// emiting the data (eg: it can be reults of a command execution)
ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
  console.log(`socket connected with id ::> ${socket.id}`);

  socket.emit("file:refresh");

  socket.on("file:change", async ({ content, path }) => {
    await fs.writeFile(`./user${path}`, content);
  });

  // setting up terminal write socket logic, i.e whenever user writes something just write the same command to the pty terminal instance.
  socket.on("terminal:write", (data) => {
    console.log("Term", data);
    if (data.endsWith("\r")) {
      ptyProcess.write(data);
    } else {
      ptyProcess.write(data);
    }
  });
});

app.get("/files", async (req, res) => {
  const fileTree = await generateFileTree("./user");

  return res.json({ tree: fileTree });
});

app.get("/files/content", async (req, res) => {
  const path = req.query.path;
  const content = await fs.readFile(`./user${path}`, "utf-8");

  return res.json({ content });
});

server.listen(9000, () => console.log(`🐋 server running on port 9000`));

async function generateFileTree(directory) {
  const tree = {};

  async function buildTree(currentDir, currentTree) {
    files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        currentTree[file] = {};
        await buildTree(filePath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  }
  await buildTree(directory, tree);

  return tree;
}
