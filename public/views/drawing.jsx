import React from 'react'

export default class Drawing extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
		 	room: {
		 		name: '',
		 		canvas: ''
		 	},
		 	host: false
		}
	}
	componentWillMount() {
	 	this.setState({
	 		room: {
	 			name: window.roomName, 
	 			canvas: window.canvas
	 		},
	 		host: window.host
	 	});
	}

	componentDidMount() {
		console.log('window.roomName: ', window.roomName);
		if (!window.roomName) {
			window.location.href = '/';
		}
		var self = this.state;
		var canvas = new fabric.Canvas('canvas', {
			isDrawingMode: true,
		});
		canvas.loadFromJSON(self.room.canvas, canvas.renderAll.bind(canvas));
		canvas.freeDrawingBrush.width = 10;
		canvas.on('path:created', function(e) {
  		this.state.room.canvas = e.path.toJSON();
			socket.emit('pathAdded', e.path.toJSON(), JSON.stringify(canvas), self.room.name);
		}.bind(this));
		socket.on('updateCanvas', function(svg) {
			console.log('drawsss');
			fabric.util.enlivenObjects([svg], function(objects) {
        console.log('objects',objects);
				objects.forEach(function(o){
					canvas.add(o);
				})
			})
		});
		socket.on('hostEndSession', function() {
			alert('Host has left this room');
			window.location.href = '/';
		})
	}

  undo() {
    this.state.canvas.pop();
    socket.emit('pathAdded',);
  }

	endSession() {
		console.log('this.state: ', this.state);
		var room = this.state.room.name;
		var host = this.state.host;
		console.log('deleted room: ', room);
		socket.emit('endSession', room, host);
		window.location.href = '/';
		socket.emit('disconnect');
	}

	render() {
		return (
			<div className= "drawingWrapper" >
        <button onClick={() => {this.undo()}}>undo</button>
				<div>
					<video controls src = "/assets/videos/test2.mov" width ="750" height="750"></video>
					<canvas id="canvas" width="750" height="700" ></canvas>
				</div>
				<button onClick={() => {this.endSession();}}>End session</button>
			</div>

			)
	}
}
