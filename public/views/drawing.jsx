import React from 'react'

//Used to render a board that we can draw on
// var Board = () => (
// 	<div>
// 		<canvas id="canvas" width="375" height="375"></canvas>
// 		</div>
// 	)

export default class Drawing extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
		 	canvas: ''
		}
	}

	componentDidMount() {
		console.log('did component mount??')
		 var canvas = new fabric.Canvas('canvas', {
		  	  isDrawingMode: true,
		  });
		 canvas.freeDrawingBrush.width = 10;
		 this.setState({canvas: canvas});
	}
	// 	// this.state.canvas = new fabric.Canvas('canvas', {
	// 	//  	  isDrawingMode: true,
	// 	// 	});
	// 	// this.state.canvas.freeDrawingBrush.width = 10;
	// 	// this.setState({
	// 	// 	canvas: canvas
	// 	// });




	// 	// socket.on('end', function () {
	// 	//   console.log('drawing ended');
	// 	//   var node = document.getElementsByClassName('drawingWrapper')[0]
	// 	//   this.triggerMouseEvent(node, 'mouseup')
	// 	//   image = JSON.stringify(canvas);
	// 	//   canvas.clear();
	// 	//   socket.removeListener('end');
	// 	// }.bind(this));

	// }

	endSession() {
		socket.emit('disconnect');
	}

  draw() {
  	socket.emit('draw', JSON.stringify(this.state.canvas));
  }	


  triggerMouseEvent (node, eventType) {
   	var clickEvent = document.createEvent ('MouseEvents');
   	clickEvent.initEvent (eventType, true, true);
   	node.dispatchEvent (clickEvent);
  }


	render() {
		return (
			<div className= "drawingWrapper" >
				<div onClick={() => {this.draw();}}>
					<canvas id="canvas" width="375" height="375" ></canvas>
				</div>
				<button onClick={() => {this.endSession()}}>End session</button>
			</div>

			)
	}
}
