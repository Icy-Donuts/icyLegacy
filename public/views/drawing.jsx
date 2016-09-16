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
		var colorString = function() {
			var rootLetter = '0123456789ABCDEF';
			var result = '#';
			for (var i = 0; i < 6; i++) {
				result += rootLetter[Math.floor(Math.random() * 10) % 16];
			}
			return result;
		};

		self.state.ownCanvas.loadFromJSON(self.state.room.canvas, self.state.ownCanvas.renderAll.bind(self.state.ownCanvas));
		self.state.ownCanvas.freeDrawingBrush.width = 10;
		self.state.ownCanvas.freeDrawingBrush.color = colorString();
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
        this.state.ownCanvas.loadFromJSON(JSON.stringify(svg), this.state.ownCanvas.renderAll.bind(this.state.ownCanvas));
 //       fabric.util.enlivenObjects([obje])
      } else {
			  fabric.util.enlivenObjects([svg], function(objects) {
          console.log('SVGGG: ', svg);
          console.log('OBJECTSSS: ', objects);
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
      console.log(this.state.history.objects);
      this.state.ownCanvas.loadFromJSON(JSON.stringify(this.state.history), this.state.ownCanvas.renderAll.bind(this.state.ownCanvas));
      socket.emit('removePath', this.state.history.objects, toRemove.left, this.state.room.name);
    } else {
      console.log('Nothing to undo :(');
    }
  }

	endSession() {
		console.log('this.state: ', this.state);
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
		return (
			<div className= "drawingWrapper" >
        <button onClick={() => {this.clear()}}>clear</button>
        <button onClick={() => {this.undo()}}>undo</button>
				<div>
					<canvas id="canvas" width="375" height="375" ></canvas>
				</div>
				<button onClick={() => {this.endSession();}}>End session</button>
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
