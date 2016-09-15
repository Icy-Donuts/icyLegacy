import React from 'react'

export default class Drawing extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			canvas: '',
		 	room: ''
		}
	}
	componentWillMount() {
	 	this.setState({room: window.roomName, canvas: window.canvas});
		// socket.emit('pathAdded', this.state.room);
	}

	componentDidMount() {
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
		})
	}

  undo() {
    var x = this.state.canvas;
    x.pop();
    socket.emit('pathAdded', x);
  }

	endSession() {
		socket.emit('disconnect', this.state.room);
	}

	render() {
		return (
			<div className= "drawingWrapper" >
        <button onClick={() => {this.undo()}}>undo</button>
				<div>
					<canvas id="canvas" width="375" height="375" ></canvas>
				</div>
				<button onClick={() => {this.endSession()}}>End session</button>
			</div>

			)
	}
}
