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
var canvas = '';

io.on('connection', function(socket) {

  socket.on('createRoom', function (data) {
    rooms[data.split(' ').join('')] = data;
    socket.join(data.split(' ').join(''));
    socket.emit('enterRoom', data.split(' ').join(''), canvas);
  });

  socket.on('pathAdded', function(path, svg, roomName) {
    canvas = svg;
    socket.broadcast.to(roomName).emit('updateCanvas', path);
  });

  socket.on('joinRoom', function(data) {
    var name = data.split(' ').join('');
    console.log('joined rooms: ', rooms);
    if (rooms[name]) {
      socket.join(name);
      socket.emit('joined', true, data, canvas);
    } else {
      socket.emit('joined', false);
    }

  });

  socket.on('endSession', function (roomName, isHost) {
    console.log('A session has ended!');
    console.log('rooms beofre deleting: ', rooms);
    console.log('isHost: ', isHost);
    if (isHost) {
      canvas = '';
      socket.broadcast.to(roomName).emit('hostEndSession');
      socket.in(roomName).leave(roomName);
      delete rooms[roomName];
      console.log('rooms after deleting: ', rooms[roomName]);
    } else {
      socket.leave(roomName);
      console.log('not host but deleted: ', rooms);
    }
  });

  socket.on('getRooms', function() {
    var roomsArr = [];
    for (room in rooms) {
      roomsArr.push(rooms[room]);
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
