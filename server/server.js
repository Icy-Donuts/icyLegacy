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
    if (rooms[name]) {
      socket.join(name);
      socket.emit('joined', true, data, canvas);
    } else {
      socket.emit('joined', false);
    }

  })

  socket.on('getRooms', function() {
    var roomsArr = [];
    for (room in rooms) {
      roomsArr.push(rooms[room]);
    }
    socket.emit('allRooms', roomsArr);
  })

  socket.on('disconnect', function (roomName) {
    console.log('A SOCKET DISCONNECTED!');
    delete clients[roomName];
  });

});


http.listen(port, function(data) {
  console.log('listening on ' + port);
});
