var express = require('express');
var app = express();
var bp = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: 'public/assets/uploads' }).single('video')
var fs = require('fs');
var aws = require('aws-sdk');
var S3_BUCKET = process.env.S3_BUCKET;
app.use(bp.urlencoded({extended:true}));
app.use(bp.json());

app.get('/')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/../public'));
app.use('/static', express.static(__dirname + '/../public/node_modules/fabric/dist'));

var rooms = {};
var rounds = 0;
var queried = false;
var images;
var chats = {};
var videotimes= {};
var paused = {};

//handles file uploads

//if (NODE_ENV=production) {
  //app.get('/sign-s3', (req, res) => {
    //var s3 = new aws.S3();
    //var fileName = req.query['file-name'];
    //var fileType = req.query['file-type'];
    //var s3Params = {
      //Bucket: S3_BUCKET,
      //Key = filename,
        //Expires: 60,
        //ContentType: fileType,
        //ACL: 'public-read'
    //};

    //s3.getSignedUrl('putObject', s3Params, (err, data) => {
      //if(err) {
        //console.log(err);
        //return res.end();
      //}
      //var returnData = {
        //signedRequest: data,
        //url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + filename;
      //};
      //res.write(JSON.stringify(returnData));
      //res.end();
    //});
  //});

  app.post('/file_upload', function (req, res) {
    upload(req, res, function (err) {
      var dirnamemod = __dirname.replace('/server',"")
      var path = dirnamemod + "/public/assets/uploads/" + req.file.path.replace('public/assets/uploads/',"");
      // console.log('PATH',path);
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


  socket.on('chatadded',function(data){
    var room = data['room'];
    if(!chats[room]){
      chats[room] = [];
    }
    // console.log(chats[room])
    room = data['room'],name = data.name, message = data.message;
    chats[room].push([name,message]);
    io.to(room).emit('updatechats', {chats:chats});
  })

  socket.on('snapped',function(data){
    // console.log('Received new image');
    io.sockets.emit('someoneSnapped',{image:data.image});
  })

  socket.on('updateTime',function(data){
    videotimes[data.room] = data.time;
    //console.log(videotimes);
  })

  socket.on('pause',function(data){
   // console.log('Emitted pause')
   paused[data.room] = true;
   // console.log(paused);
    io.sockets.emit('pauseAll',{});
  })

  socket.on('play',function(){
    io.sockets.emit('playAll',{});
  })

  socket.on('half',function(){
    io.sockets.emit('halveAll',{});
  })



  socket.on('createRoom', function (roomname, username,streamer,loadedfromfile) {
    console.log('STREAMER',streamer);
    var formatedRoomName = roomname.split(' ').join('');
    // rooms[formatedRoomName] = '';
    chats[formatedRoomName] = [];
    videotimes[formatedRoomName] = 0;
    // console.log('CHATS',chats)


    rooms[formatedRoomName] = {};
    rooms[formatedRoomName]['canvas'] = [];
    rooms[formatedRoomName]['users'] = {};
    rooms[formatedRoomName]['users'][socket.id] = username;
    socket.join(formatedRoomName);
    console.log('SERVERSIDEFILE',loadedfromfile)
    socket.emit('enterRoom', formatedRoomName, rooms[formatedRoomName],streamer,loadedfromfile);
    var roomsArr = [];
    for (room in rooms) {
      roomsArr.push(room);
    }


    io.emit('allRooms', roomsArr);


    setInterval(function(){
      socket.emit('updatechats',{chats:chats})
    },2000)

  });

  socket.on('pathAdded', function(path, svg, roomName) {
    rooms[roomName].canvas = svg;
    path.id = rooms[roomName].users[socket.id];
    // console.log('path: ', path);
    socket.broadcast.to(roomName).emit('updateCanvas', path);
  });

  socket.on('joinRoom', function(roomName, username) {
    var name = roomName.split(' ').join('');
    if (rooms[name] !== undefined) {
      rooms[name].users[socket.id] = username;
      // console.log('try to join: ', rooms[name]);
      socket.join(name);
      socket.emit('joined', true, name, rooms[name]);
      socket.broadcast.to(roomName).emit('updateUser', rooms[name])
    } else {
      socket.emit('joined', false);
    }

    setInterval(function(){
      socket.emit('updatechats',{chats:chats})
    },2000)


    setTimeout(function(){socket.emit('sendStartTime',{time:videotimes[roomName],pausedbool:paused[roomName]});},1000)


  });

  socket.on('removePath', function(pathArr, leftValue, room) {
    var allPaths = JSON.parse(rooms[room].canvas);
    // console.log(pathArr);
    var objects = [];
    allPaths.objects.map(function(item) {
      if (item.left !== leftValue) {
        objects.push(item);
      }
    });
    allPaths.objects = objects;
    rooms[room].canvas = JSON.stringify(allPaths);
    // console.log(rooms[room]);
    io.to(room).emit('updateCanvas', allPaths, leftValue);
  });


  socket.on('endSession', function (roomName, isHost) {
    // console.log('A session has ended!');
    // console.log('rooms beofre deleting: ', rooms);
    // console.log('isHost: ', isHost);
    var dirnamemod = __dirname.replace('/server',"")
    var vidpath = dirnamemod + "/public/assets/uploads/" + roomName;

    // fs.unlink(vidpath,function(err){
    //   console.log('VIDEO DELETION ERROR',err);
    // })
    if (isHost) {
      fs.unlink(vidpath,function(err){
         console.log('VIDEO DELETION ERROR',err);
       })
      socket.broadcast.to(roomName).emit('hostEndSession');
      socket.in(roomName).leave(roomName);
      // console.log('RoomName= ', roomName, ' rooms[roomName]= ' + rooms[roomName]);
      delete rooms[roomName];
      var roomsArr = [];
      for (room in rooms) {
        roomsArr.push(room);
      }

      io.emit('allRooms', roomsArr);
      // console.log('rooms after deleting: ', rooms);
    } else {
      delete rooms[roomName].users[socket.id];
      socket.broadcast.to(roomName).emit('updateUser', rooms[roomName]);
      socket.leave(roomName);
      // console.log('not host but deleted: ', rooms);
    }
  });

  socket.on('getRooms', function() {
    var roomsArr = [];
    for (room in rooms) {
      roomsArr.push(room);
    }
    socket.emit('allRooms', roomsArr);
  });

  // socket.on('clear', function(room) {
  //   rooms[room] = '';
  // });

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
