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
		if (!window.roomName) {
			window.location.href = '/';
		}
		var canvas = new fabric.Canvas('canvas', {
			isDrawingMode: true,
		});
    this.state.ownCanvas =  canvas;
		var self = this;
		self.state.ownCanvas.loadFromJSON(self.state.room.canvas, self.state.ownCanvas.renderAll.bind(self.state.ownCanvas));
		self.state.ownCanvas.freeDrawingBrush.width = 10;
		self.state.ownCanvas.on('path:created', function(e) {
      var id = uuid.v4();
      self.state.history.objects.push(e.path.toJSON());
  		self.state.room.canvas = e.path.toJSON();
			socket.emit('pathAdded', e.path.toJSON(), JSON.stringify(self.state.ownCanvas), self.state.room.name);
		}.bind(this));

		socket.on('updateCanvas', function(svg, leftVal) {
      console.log(this.state.history);
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

	endSession() {
		var room = this.state.room.name;
		var host = this.state.host;
		socket.emit('endSession', room, host);
		// window.location.href = '/';
		socket.emit('disconnect');
	}

	render() {
		return (
			<div className= "drawingWrapper" >
        <button onClick={() => {this.clear()}}>clear</button>
        <button onClick={() => {this.undo()}}>undo</button>
				<div>
					<canvas id="canvas" width="750" height="375" ></canvas>
				</div>
				<button onClick={() => {this.endSession();}}>End session</button>
			</div>

			)
	}
}
