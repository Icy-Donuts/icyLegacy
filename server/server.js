var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/../public'));
app.use('/static', express.static(__dirname + '/../public/node_modules/fabric/dist'));

var clients = {};
var rooms = {};
var rounds = 0;
var queried = false;
var images;

io.on('connection', function(socket) {
  // console.log('socket.id: ', socket.id);
  // clients[socket.id] = [];
  socket.on('createRoom', function (roomname, username) {
    var formatedRoomName = roomname.split(' ').join('');
    rooms[formatedRoomName] = {};
    rooms[formatedRoomName]['canvas'] = [];
    rooms[formatedRoomName]['users'] = {};
    rooms[formatedRoomName]['users'][socket.id] = username;
    console.log('created rooms: ', rooms);
    socket.join(formatedRoomName);
    socket.emit('enterRoom', formatedRoomName, rooms[formatedRoomName]);
  });

  socket.on('pathAdded', function(path, svg, roomName) {
    rooms[roomName].canvas = svg;
    console.log('pathAdded: ', roomName, ' from: ', socket.id);
    // clients[socket.id].push(path);
    path.id = rooms[roomName].users[socket.id];
    console.log('path: ', path);
    socket.broadcast.to(roomName).emit('updateCanvas', path);
  });

  socket.on('joinRoom', function(roomName, username) {
    var name = roomName.split(' ').join('');
    console.log('joined rooms: ', rooms);
    if (rooms[name] !== undefined) {
      rooms[name].users[socket.id] = username;
      console.log('try to join: ', rooms[name]);
      socket.join(name);
      socket.emit('joined', true, name, rooms[name]);
      socket.broadcast.to(roomName).emit('updateUser', rooms[name])
    } else {
      socket.emit('joined', false);
    }
  });


  socket.on('endSession', function (roomName, isHost) {
    console.log('A session has ended!');
    console.log('rooms beofre deleting: ', rooms);
    console.log('isHost: ', isHost);
    if (isHost) {
      socket.broadcast.to(roomName).emit('hostEndSession');
      socket.in(roomName).leave(roomName);
      delete rooms[roomName];
      console.log('rooms after deleting: ', rooms);
    } else {
      delete rooms[roomName].users[socket.id];
      socket.broadcast.to(roomName).emit('updateUser', rooms[roomName]);
      socket.leave(roomName);
      console.log('not host but deleted: ', rooms);
    }
  });

  socket.on('getRooms', function() {
    var roomsArr = [];
    for (room in rooms) {
      roomsArr.push(room);
    }
    socket.emit('allRooms', roomsArr);
  })

  socket.on('disconnect', function () {
    console.log('A SOCKET DISCONNECTED!');
    delete socket.adapter.rooms[socket.id];
  });

});


http.listen(port, function(data) {
  console.log('listening on ' + port);
});
