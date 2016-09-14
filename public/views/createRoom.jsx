import React from 'react'


//Simple ready view
export default class CreateRoom extends React.Component {
	constructor(props) {
		super(props)
	}
	componentWillMount() {
		var currentRoom;
		socket.on('enterRoom', function(roomName) {
			window.roomName = roomName;
			window.location.href = '#/drawing';
		});
		socket.on('joined', function(didJoin, roomName, canvas) {
			if (didJoin) {
				window.roomName = roomName;
				window.location.href = '#/drawing';
				window.canvas = canvas;
			} else {
				console.log('That room does not exist');
			}
		})
	}

	
	startSession(host) {
		socket.emit('createRoom', host);
		document.getElementById('roomTitle').value = '';
	}

	joinRoom(roomName) {
		socket.emit('joinRoom', roomName);
		document.getElementById('roomTitle').value = '';
	}

	render() {
		return (
		<div className="readyScreen valign">
			<div>
				<h3 className="tlt">Join Room</h3>
				<input type="text" 
				       id="roomTitle" 
					   placeholder="Room to join..." />
				<button onClick={() => {var room = document.getElementById('roomTitle').value; this.joinRoom(room);}}>
					Join a room
				</button>
			</div>
			<div>
				<h3 className="tlt"> Create Rooom Session </h3>
				<input type="text" id="hostTitle" placeholder="Title here..." />
				<button 
					className="btn waves-effect waves-light"
					onClick={() => {var title = document.getElementById('hostTitle').value; this.startSession(title)}}>
					Create a room
				</button>
			</div>
		</div>
	)}
}
