const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/index.html"));
});

app.use("/styles", express.static("client/styles"));
app.use("/js", express.static("client/js"));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT || 3003, () => {
  console.log("Server is running");
});

// const io = require("socket.io")(server);

// app.use(express.static("public"));

// app.use(express.static(__dirname + "/public"));

const users = {};
io.sockets.on("connection", (client) => {
  client.emit("hello", "Connected to the server");
  const broadcast = (event, data) => {
    client.emit(event, data);
    client.broadcast.emit(event, data);
  };
  broadcast("user", users);
  client.on("message", (message) => {
    if (users[client.id] !== message.name) {
      users[client.id] = message.name;
      broadcast("user", users);
    }
    broadcast("message", message);
  });
  client.on("disconnect", () => {
    delete users[client.id];
    client.broadcast.emit("user", users);
  });
});
