var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var drawingController = require('./resources/drawingController');
var port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/../public'));
app.use('/static', express.static(__dirname + '/../public/node_modules/fabric/dist'));

var clients = {};
var rounds = 0;
var queried = false;
var images;
var canvas;

io.on('connection', function(socket) {
  socket.on('name', function (name) {
    socket.name = name;
    clients[name] = 0;
    socket.emit('readyView');
  });

  socket.on('ready', function (host) {
    console.log('ready');
    socket.name = host.title;
    console.log('socket.name: ', host.title);
    io.emit('enterRoom');
    // setTimeout(function () {
    //   io.emit('draw');
    //   setTimeout(function () {
    //     io.emit('end');
    //   }, 5000);
    // }, 4000);
  });
  socket.on('draw', function(svg) {
    canvas = svg;
  });


  // socket.on('image', function (data) {

  //   drawingController.addDrawing({
  //     playerName: socket.name,
  //     roundId: rounds,
  //     vectorDrawing: data
  //   });

  //   setTimeout(function () {
  //     if (!queried) {
  //       drawingController.retrieveRoundsDrawings(rounds, function (data) {
  //         images = data;
  //         console.log('DATA HERE IS', data);
  //         var time = Math.max(10, Object.keys(clients).length * 2);
  //         console.log('time', time);
  //         io.emit('vote', {
  //           images: images,
  //           time: time
  //         });
  //         setTimeout(function () {
  //           io.emit('countVotes');
  //         }, time * 1000);
  //       });
  //       queried = true;
  //     }

  //   }, 4000);

  // });

  // socket.on('vote', function (name) {
  //   drawingController.updateVoteCount(rounds, name, function() {
  //     drawingController.retrieveRoundsDrawings(rounds, function (data) {
  //       images = data;
  //       console.log('images', images);

  //       setTimeout(function () {
  //         socket.emit('results', {
  //           images: images,
  //           playerName: socket.name,
  //           rounds: rounds,
  //           wins: null
  //         });
  //       }, 1000);

  //     });

  //   });

  // });

//   socket.on('again', function () {
//     rounds++;
//     queried = false;
//     io.emit('readyView');
//   });

  socket.on('disconnect', function (something) {
    console.log('A SOCKET DISCONNECTED!');
    console.log('canvas: ', canvas);
    delete clients[socket.name];
  });

});


http.listen(port, function(data) {
  console.log('listening on ' + port);
});
