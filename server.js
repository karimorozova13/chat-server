const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
require("dotenv").config();

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

//  SEND EMAIL LOGIC
/**
 * const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  from: "karimorozova13@gmail.com",
  to: "k.morozova@tiomarkets.com",
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: "<strong>Kari MOROZOVA</strong>",
};
app.post("/", (req, res) => {
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error.response.body);
    });
  res.json("Mail sent");
});
 * 
 */
