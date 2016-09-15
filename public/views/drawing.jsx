import React from 'react'

export default class Drawing extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			canvas: '',
		 	room: '',
		 	host: false
		}
	}
	componentWillMount() {
	 	this.setState({
	 		room: window.roomName, 
	 		canvas: window.canvas,
	 		host: window.host
	 	});
	}

	componentDidMount() {
		if (!window.roomName) {
			window.location.href = '/';
		}
	 	
		var self = this.state;
		var canvas = new fabric.Canvas('canvas', {
			isDrawingMode: true,
		});
		canvas.loadFromJSON(self.canvas, canvas.renderAll.bind(canvas));
		canvas.freeDrawingBrush.width = 10;
		canvas.on('path:created', function(e) {
      this.setState({canvas: e.path.toJSON()});
			socket.emit('pathAdded', e.path.toJSON(), JSON.stringify(canvas), self.room);
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
		var room = this.state.room;
		var host = this.state.host;
		socket.emit('endSession', room, host);
		window.location.href = '/';
		socket.emit('disconnect');
	}

	render() {
		return (
			<div className= "drawingWrapper" >
        <button onClick={() => {this.undo()}}>undo</button>
				<div>
					<canvas id="canvas" width="375" height="375" ></canvas>
				</div>
				<button onClick={() => {this.endSession();}}>End session</button>
			</div>

			)
	}
}
