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

	start(host) {
		socket.emit('ready', host);
	}

	render() {
		return (
		<div className="readyScreen valign">
			<h1 className="tlt"> Create Rooom Session </h1>

			<input type="text" id="hostTitle" placeholder="Title here..." />Title:
			<input id="hostVideo" type="text" placeholder="Video here..." />Video URL:
			<input id="hostName" type="text" placeholder="Name here..." />Name:
			<button className="btn waves-effect waves-light" value="Press this button when everyone is in" onClick={() => {var host = {title: document.getElementById('hostTitle').value, videoUrl: document.getElementById('hostVideo').value, name: document.getElementById('hostName').value}; this.start(host);}}>Start a session!!</button>
		</div>
	)}
}
