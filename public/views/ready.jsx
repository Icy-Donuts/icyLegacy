import React from 'react'


//Simple ready view
export default class CreateRoom extends React.Component {
	constructor(props) {
		super(props)
	}

	componentWillMount() {
		socket.on('enterRoom', function() {
		//	window.Animal = animalName;
			window.location.href = '#/drawing'
		  //redirect to countdown view
		});
	}

	start() {
		socket.emit('ready');
	}

	render() {
		return (
		<div className="readyScreen valign">
			<h1 className="tlt"> Everyone Ready? </h1>
			<button className="btn waves-effect waves-light" value="Press this button when everyone is in" onClick={this.start}>Press this button when everyone is ready</button>
		</div>
	)}
}
