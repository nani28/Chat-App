const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { getMessage, getLocationMessage } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

const msg = "Welcome!";
io.on("connection", (socket) => {
  console.log("New websocket connection!");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    socket.join(room);

    if (error) {
      return callback(error);
    }
    socket.emit("message", getMessage('Admin', msg));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        getMessage('Admin', `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomdata", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("exchangeMsg", (clinetMessage, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(clinetMessage)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", getMessage(user.username, clinetMessage));
    callback();
  });

  socket.on("sendLocation", (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "gotLocation",
      getLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.lat},${position.log}`
      )
    );

    callback("Location send successfully!");
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        getMessage(user.username, `${user.username} has disconnect!`)
      );
      io.to(user.room).emit("roomdata", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on ${port}!`);
});
