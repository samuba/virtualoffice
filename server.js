const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const compression = require('compression');

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.raw())
app.use(bodyParser.text())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"));

const rooms = {
  testRoom: {
    users: {
     user1: { imageData: "", updatedAt: new Date(), name:"tester" }
    },
    chat: getArrayWithLimitedLength(3)
  },
};

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html"); 
});

app.get("/rooms", (request, response) => {
  response.json(rooms);
});

app.get("/rooms/:roomId", (req, res) => {
  const roomId = req.params.roomId
  const room = rooms[roomId] || createRoom(roomId)
  purgeOldUsers(room)
  res.json(room);
});

app.put("/rooms/:roomId/:userId", (req, res) => {
  const roomId = req.params.roomId
  const userId = req.params.userId
  const room = rooms[roomId] || createRoom(roomId)
  setUser(room, userId, req.body.imageData)
  res.sendStatus(200);
});

app.put("/rooms/:roomId/:userId/chat", (req, res) => {
  const roomId = req.params.roomId
  const userId = req.params.userId
  const room = rooms[roomId] || createRoom(roomId)
  postChatMessage(room, room.users[userId], req.body); 
  res.json(room.chat);
});

function postChatMessage(room, user, message) {
  console.log("new message", user)
  room.chat.push({
    authorName: user.name,
    message: message,
    createdAt: new Date(),
  })
}

function purgeOldUsers(room) {
  for(let user in room.users) {
    if ((new Date() - room.users[user].updatedAt) > (1000 * 20)) {
      console.log("purge expired user: " + user)
      delete room.users[user]
    }
  }
}

function setUser(room, userId, imageData) {
  room.users[userId] = {
    imageData: imageData,
    updatedAt: new Date(),
    name: userId
  }
  return room.users[userId]
}

function createRoom(roomId) {
  rooms[roomId] = {
    users: {},
    chat: getArrayWithLimitedLength(500)
  };
  return rooms[roomId];
}

function getArrayWithLimitedLength(length) {
    var array = new Array();
    array.push = function () {
        if (this.length >= length) {
            this.shift();
        }
        return Array.prototype.push.apply(this,arguments);
    }
    return array;
}

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
