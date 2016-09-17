import React from 'react';
import uuid from 'uuid';

export default class Drawing extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			ownCanvas: '',
		 	room: {
		 		name: '',
		 		canvas: ''
		 	},
		 	history: {
        objects: []
      },
		 	host: false,
		 	username: '',
		 	userColor: {}
		}
	}

	getUsers() {
		var users = [];
		for (var user in window.username) {
			users.push(window.username[user]);
		}
		return users;
	}

	componentWillMount() {
		var colorString = function() {
			var rootLetter = '0123456789ABCDEF';
			var result = '#';
			for (var i = 0; i < 6; i++) {
				result += rootLetter[Math.floor(Math.random() * 10) % 16];
			}
			return result;
		};

		var userColor = colorString();
		this.state.userColor = {color: userColor};
		var users = this.getUsers();
	 	this.setState({
	 		room: {
	 			name: window.roomName,
	 			canvas: window.canvas,
	 		},
	 		host: window.host,
	 		username: users,
	 	});
	}

	componentDidMount() {
		//if (!window.roomName) {
			//window.location.href = '/';
		//}
		var self = this;
		var canvas = new fabric.Canvas('canvas', {
			isDrawingMode: true,
		});
		this.state.ownCanvas = canvas;

		self.state.ownCanvas.loadFromJSON(self.state.room.canvas, self.state.ownCanvas.renderAll.bind(self.state.ownCanvas));
		self.state.ownCanvas.freeDrawingBrush.width = 10;
		self.state.ownCanvas.freeDrawingBrush.color = self.state.userColor.color;

		self.state.ownCanvas.on('path:created', function(e) {
      var id = uuid.v4();
      self.state.history.objects.push(e.path.toJSON());
  		self.state.room.canvas = e.path.toJSON();
			socket.emit('pathAdded', e.path.toJSON(), JSON.stringify(self.state.ownCanvas), self.state.room.name);
		}.bind(this));

		socket.on('updateUser', function(roomObj) {
			window.username = roomObj.users;
			var newusers = self.getUsers();
			self.setState({
				username: newusers
			});
			console.log('current state: ', self.state);
		});

		socket.on('updateCanvas', function(svg, leftVal) {
      if (leftVal) {
        var x = svg;
        this.state.ownCanvas.loadFromJSON(JSON.stringify(svg), this.state.ownCanvas.renderAll.bind(this.state.ownCanvas));
      } else {
			  fabric.util.enlivenObjects([svg], function(objects) {
				  objects.forEach(function(o){
					  self.state.ownCanvas.add(o);
				  })
			  })
      }
		}.bind(this));

		socket.on('hostEndSession', function() {
			alert('Host has left this room');
			window.location.href = '/';
		});


		//socket.on('updatechats',function(data){
			//console.log('Updated chats');
			//var chatholder = $('#chats')
			//chatholder.empty();
			//console.log(data);
			////console.log(data.chats[window.roomName]);
			//if(window.roomName in data.chats){
				//data.chats[window.roomName].forEach(function(chat){
					//var chat = $('<li>' + chat[0] + ":" + chat[1] + "</li>");
					//chatholder.append(chat);
				//})
			//}
		//})

		socket.on('updatechats',function(data){
			console.log('Updated chats');
			var chatholder = $('#chats')
			chatholder.empty();
			console.log(data);
			//console.log(data.chats[window.roomName]);
			if(window.roomName in data.chats){
				data.chats[window.roomName].forEach(function(chat){
					var chat = $('<li class="chat-item">' + "<span class='chat-username'>" + chats[0] + ": </span>" + "<span class='chat-text'>" + chat[1] + "</span></li>");
					chatholder.append(chat);
				}.bind(this))
			}
		}.bind(this))

		if(this.state.host){
			document.getElementById('video').addEventListener('loadedmetadata', function() {this.currentTime = 2;this.play()}, false);

			setInterval(function(){
				var video = document.getElementById('video');
				var ct = video.currentTime;
				//console.log(ct);
				socket.emit('updateTime',{room:window.roomName,time:ct})
			},1000)
		} else {
			socket.on('sendStartTime',function(data){
				console.log('started');
				var vid = document.getElementById('video');
				vid.currentTime = data.time;
				vid.play();
				console.log(data.pausedbool);
				if(data.pausedbool){
					vid.pause();
				}
			})
		}

		socket.on('someoneSnapped',function(data){
			console.log('Someone has a question');
			console.log(data.image);
			//console.log($('#snappedoverlay'));
			//$('#snappedoverlay').append($(data.image));
			//document.getElementById('snappedoverlay').appendChild(data.image);
		});

		socket.on('pauseAll',function(data){
			console.log('HEARD PAUSE');
			var vid = document.getElementById('video');
			vid.pause();
		})

		socket.on('playAll',function(data){
			console.log('HEARD PLAY');
			var vid = document.getElementById('video');
			vid.play();
		})

		socket.on('halveAll',function(){
			var vid = document.getElementById('video');
			vid.playbackRate = 0.5;
		})
	}

  // clear() {
  //   self.state.canvas.clear();
  //   socket.emit('clear');
  // }

  undo() {
    if (this.state.history.objects.length > 0) {
      var toRemove = this.state.history.objects[this.state.history.objects.length - 1];
      console.log('one to remove, ', toRemove.left);
      this.state.history.objects.pop();
      socket.emit('removePath', this.state.history.objects, toRemove.left, this.state.room.name);
    } else {
      console.log('Nothing to undo :(');
    }
  }

  	save(){
		var thecanvas = document.createElement('canvas')
		var notecanvas = document.createElement('canvas')
		var ctx = notecanvas.getContext('2d');
		ctx.font = "30px Arial";
		ctx.fillText("Hello World",0,0);
		var currentcanvas = document.getElementById('canvas');
		var video = document.getElementById('video')
		console.log('save')
		var context = thecanvas.getContext('2d');
	    context.drawImage(video, 0, 0, 220, 150);
	    context.drawImage(currentcanvas,0,0,250,150);
	    var dataURL = thecanvas.toDataURL();

	    //create img
	    var img = document.createElement('img');
	    img.width = 250;
	    img.height = 250;
	    img.setAttribute('src', dataURL);

	    socket.emit('snapped',{image:img});

	    //append img in container div
	    document.getElementById('thumbnailContainer').appendChild(img);

	}

		writeonCanvas(){

		var canvas = document.getElementByType('canvas');
		var ctx = canvas.getContext('2d');
		ctx.font = "30px Arial";
		ctx.fillText("Hello World",0,0);
	}

	endSession() {
		var room = this.state.room.name;
		var host = this.state.host;
		var username = this.state.username;
		socket.emit('endSession', room, host);
		window.location.href = '/';
		socket.emit('disconnect');
	}

	filterUsers(username) {
		console.log('current canvas: ', this.state.ownCanvas);
		var currentCanvas = this.state.ownCanvas;
		var users = this.getUsers();
		for (var i = 0; i < currentCanvas._objects.length; i++) {
			if (currentCanvas._objects[i].id !== undefined) {
				if (currentCanvas._objects[i].id === username) {
					currentCanvas._objects[i].visible = !currentCanvas._objects[i].visible;
				}
			}
		}
		this.setState({
	 		room: {
	 			name: window.roomName,
	 			canvas: currentCanvas,
	 		},
	 		host: window.host,
	 		username: users,
	 	});
	 	this.state.ownCanvas.renderAll();
	}

	render() {
		console.log(this.state.userColor);
		return (
      <div className= "drawingWrapper">
	      <div id="chatsholder">
          <div className="chat-input-container">
			  	  <textarea id="chatMessage" className="chat-input" placeholder = "Enter your message" ></textarea>
            <div className="input-button-container">
			  	    <button
                className="send-icon"
                id="newChatSubmit" onClick = {()=>{
			  				var chatMessage = $('#chatMessage').val();
                var username = window.username['/#' + socket.id];
			  				socket.emit('chatadded',
                  {name:username,message:chatMessage,room:window.roomName});
                  $('#chatMessage').val('');}}>
                <i className="material-icons">
                  send
                </i>
              </button>
            </div>
          </div>
			    <ul id="chats"></ul>
			  </div>

        <div className="video-container">
			    <button
            className="exit-icon"
            onClick={() => {
              this.endSession();
            }}>
            <i className="material-icons">
              exit_to_app
            </i>
            <span>
              exit
            </span>
          </button>
          <div className="main-video">
			  	  <div className="canvas-video-container">
			  		  <video id = "video" src = {"/assets/uploads/" + 'aaa'} width ="750" height="750"></video>
			  		  <canvas id="canvas" width="750" height="700" ></canvas>
			  	  </div>
            <div className="actions">
              <button
                className="action-control"
                onClick={() => {this.undo()}}>
                  <i className="material-icons">undo</i>
                  <span className="actions-span">undo</span>
              </button>
              <button
                className="action-control"
                onClick = {this.save}>
                  <i className="material-icons">save</i>
                  <span className="actions-span">save</span>
              </button>
            </div>
          </div>

          <div className="video-controls-container">
            <button
              className="video-control"
              onClick = {function(){
                var vid = document.getElementById('video');
                vid.pause();
                socket.emit('pause',{room:window.roomName})}}>
              <i className="material-icons">
                pause
              </i>
            </button>
            <button
              className="video-control play"
              onClick = {function(){
                var vid = document.getElementById('video');
                vid.play();
                socket.emit('play')}}>
              <i className="material-icons">
                play_arrow
              </i>
            </button>
            <button
              className="video-control"
              onClick = {function(){
                document.getElementById("video").playbackRate = 0.5;
                socket.emit('half')}}>
                <i className="material-icons">
                  slow_motion_video
                </i>
              </button>
          </div>

          <div className="bottom-content">
            <div className="users">
              <h3>Users</h3>
              <h5>Currently in this chat</h5>
              <ul>
                <li className="user-list-entry">
                  <span className="list-user-name">Jordan</span>
                  <span className="list-user-span">filter drawings</span>
                </li>
                <li className="user-list-entry">
                  <span className="list-user-name">Yu-An</span>
                  <span className="list-user-span">filter drawings</span>
                </li>
                <li className="user-list-entry">
                  <span className="list-user-name">David</span>
                  <span className="list-user-span">filter drawings</span>
                </li>


		            {this.state.username.map(function(user, index) {
                  return(
                    <li key={index}
                      className="user-list-entry"
                      onClick={() => {
                        this.filterUsers(user)}
                      }>
                      <span className="list-user-name">{user}</span>
                      <span className="list-user-span">filter drawings</span>
                    </li>
                  )
                }.bind(this))}
		          </ul>
            </div>
            <div className="thumbnails" id="thumbnailContainer">
              <h3>Snapshots</h3>
              <h5>From your conversation</h5>
            </div>
          </div>
        </div>
      </div>
  )}
}
