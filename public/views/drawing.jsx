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
		if (!window.roomName) {
			window.location.href = '/';
		}
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
        console.log('svg: ', svg.objects);
        var x = svg;
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


		socket.on('updatechats',function(data){
			console.log('Updated chats');
			var chatholder = $('#chats')
			chatholder.empty();
			console.log(data);
			//console.log(data.chats[window.roomName]);
			if(window.roomName in data.chats){
				data.chats[window.roomName].forEach(function(chat){
					var chat = $('<li>' + chat[0] + ":" + chat[1] + "</li>");
					chatholder.append(chat);
				})
			}
		})

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
			})
		}


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

  clear() {
    self.state.canvas.clear();
    socket.emit('clear');
  }

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
		// window.location.href = '/';
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
			<div className= "drawingWrapper" >
			<div><h3>Welcome to {this.state.username[0]}'s Room!!</h3></div>
        <button onClick={() => {this.clear()}}>clear</button>
        <button onClick={() => {this.undo()}}>undo</button>
        <button onClick = {function(){var vid = document.getElementById('video');vid.play();socket.emit('play')}}> Play </button>
        <button onClick = {function(){var vid = document.getElementById('video');vid.pause();socket.emit('pause')}}> Pause </button>
        <button onClick = {function(){ document.getElementById("video").playbackRate = 0.5;socket.emit('half')}}>Half-speed</button>
        <button onClick = {this.save}> Save </button>
        <button onClick = {this.writeOnCanvas}>Note</button>
				<div>
					<video id = "video" src = {"/assets/uploads/" + window.roomName} width ="750" height="750"></video>
					<canvas id="canvas" width="750" height="700" ></canvas>
					<div id="chatsholder">
						<ul id="chats"></ul>
						<input id="userNameInput" class="chatinput" placeholder = "Enter your username" ></input>
						<input id="chatMessage" class="chatinput" placeholder = "Enter your message" ></input>
						<button id="newChatSubmit" onClick = {()=>{
							var username = $('#userNameInput').val()
							var chatMessage = $('#chatMessage').val();
							socket.emit('chatadded',{name:username,message:chatMessage,room:window.roomName})
						}}>Submit Chat</button>
					</div>
					<div id="thumbnailContainer"></div>
				</div>
				<button onClick={() => {this.endSession();}}>End session</button>
				<div></div>
				<ul>
					{this.state.username.map(function(user, index) {
        return(
          <li key={index} onClick={() => {this.filterUsers(user)}}>{user}</li>
        )
      }.bind(this))}
				</ul>
			</div>

			)
	}
}
