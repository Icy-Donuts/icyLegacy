var express = require('express');
var app = express();
var bp = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: 'public/assets/uploads' }).single('video')
var fs = require('fs');

app.use(bp.urlencoded({extended:true}));
app.use(bp.json());

app.get('/')
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

//handles file uploads
app.post('/file_upload', function (req, res) {

  upload(req, res, function (err) {
    var dirnamemod = __dirname.replace('/server',"")
    var path = dirnamemod + "/public/assets/uploads/" + req.file.path.replace('public/assets/uploads/',"");
    console.log('PATH',path);
    fs.rename(path,path.slice(0,path.indexOf('public/assets/uploads/')+22) + req.body.roomtitle.replace(" ",""),function(err){
      if(err){console.log(err);}
    })
    if (err) {
      // An error occurred when uploading
      return
    }

    // Everything went fine
  })
})

io.on('connection', function(socket) {

// <<<<<<< 6d60a4b5d0e61f0a8093a7b8406d66e122e7b7ae
  socket.on('createRoom', function (name) {
    name = name['host'];
    var formatedRoomName = name.split(' ').join('');
    rooms[formatedRoomName] = '';
    console.log('created rooms: ', rooms);
    socket.join(formatedRoomName);
    socket.emit('enterRoom', formatedRoomName, rooms[formatedRoomName]);
// =======
  // socket.on('createRoom', function (data) {
  //   data = data['host']
  //   rooms[data.split(' ').join('')] = data;
  //   socket.join(data.split(' ').join(''));
  //   socket.emit('enterRoom', data.split(' ').join(''), canvas);
// >>>>>>> Send host boolean in object rather than as variable to server
  });

  socket.on('pathAdded', function(path, svg, roomName) {
    rooms[roomName] = svg;
    console.log('pathAdded: ', roomName);
    socket.broadcast.to(roomName).emit('updateCanvas', path);
  });

  socket.on('joinRoom', function(roomName) {
    var name = roomName.split(' ').join('');
    console.log('joined rooms: ', rooms);
    if (rooms[name] !== undefined) {
      socket.join(name);
      socket.emit('joined', true, name, rooms[name]);
    } else {
      socket.emit('joined', false);
    }

  });

  socket.on('endSession', function (roomName, isHost) {
    console.log('A session has ended!');
    console.log('rooms beofre deleting: ', roomName);
    console.log('isHost: ', isHost);

    var dirnamemod = __dirname.replace('/server',"")
    var vidpath = dirnamemod + "/public/assets/uploads/" + roomName;

    fs.unlink(vidpath,function(err){
      console.log('VIDEO DELETION ERROR',err);
    })

    if (isHost) {
      socket.broadcast.to(roomName).emit('hostEndSession');
      socket.in(roomName).leave(roomName);
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
  })

  socket.on('disconnect', function () {
    console.log('A SOCKET DISCONNECTED!');
    delete socket.adapter.rooms[socket.id];
  });

});


http.listen(port, function(data) {
  console.log('listening on ' + port);
});
