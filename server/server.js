var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/../public'));
app.use('/static', express.static(__dirname + '/../public/node_modules/fabric/dist'));

var rooms = {};
var rounds = 0;
var queried = false;
var images;

io.on('connection', function(socket) {

  socket.on('createRoom', function (name) {
    var formatedRoomName = name.split(' ').join('');
    rooms[formatedRoomName] = '';
    console.log('created rooms: ', rooms);
    socket.join(formatedRoomName);
    socket.emit('enterRoom', formatedRoomName, rooms[formatedRoomName]);
  });

  socket.on('pathAdded', function(path, svg, roomName) {
    rooms[roomName] = svg;
    console.log(path);
    socket.broadcast.to(roomName).emit('updateCanvas', path);
  });

  socket.on('joinRoom', function(roomName) {
    var name = roomName.split(' ').join('');
    if (rooms[name] !== undefined) {
      socket.join(name);
      socket.emit('joined', true, name, rooms[name]);
    } else {
      socket.emit('joined', false);
    }
  });

  socket.on('removePath', function(pathArr, leftValue, room) {
    var allPaths = JSON.parse(rooms[room]);
    console.log(pathArr);
    var objects = [];
    allPaths.objects.map(function(item) {
      if (item.left !== leftValue) {
        objects.push(item);
      }
    });
    allPaths.objects = objects;
    rooms[room] = JSON.stringify(allPaths);
    console.log(rooms[room]);
    io.to(room).emit('updateCanvas', allPaths, leftValue);
  });

  socket.on('endSession', function (roomName, isHost) {
    console.log('A session has ended!');
    console.log('rooms beofre deleting: ', roomName);
    console.log('isHost: ', isHost);
    if (isHost) {
      socket.broadcast.to(roomName).emit('hostEndSession');
      socket.in(roomName).leave(roomName);
      console.log('RoomName= ', roomName, ' rooms[roomName]= ' + rooms[roomName]);
      delete rooms[roomName];
      console.log('rooms after deleting: ', rooms);
    } else {
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
  });

  socket.on('clear', function(room) {
    rooms[room] = '';
  });

  socket.on('undoTriggered', function() {
    socket.emit('undo');
  });

  socket.on('disconnect', function () {
    console.log('A SOCKET DISCONNECTED!');
    delete socket.adapter.rooms[socket.id];
  });

});


http.listen(port, function(data) {
  console.log('listening on ' + port);
});
