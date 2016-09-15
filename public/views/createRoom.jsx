import React from 'react'


//Simple ready view
export default class CreateRoom extends React.Component {
	constructor(props) {
		super(props)
    this.state = {
      rooms: []
    };
	}
	componentWillMount() {
		var currentRoom;
    var self = this;
		socket.on('enterRoom', function(roomName) {
			window.roomName = roomName;
      window.canvas = canvas;
			window.host = true;
			window.location.href = '#/drawing';
      socket.removeListener('allRooms');
		});

    socket.emit('getRooms');

    socket.on('allRooms', function() {
      this.setState({rooms: rooms};);
    }.bind(this));

		socket.on('joined', function(didJoin, roomName, canvas) {
			if (didJoin) {
				window.roomName = roomName;
				window.host = false;
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
			<h3 className="tlt"> Join Rooom Session </h3>
      <ul> {this.state.rooms.map(function(room, index) {
        return(
          <li key={index} onClick={() => {this.joinRoom(room)}}>{room}</li>
        )
      }.bind(this))}
      </ul>	
			<h3 className="tlt"> Create Rooom Session </h3>
			<input type="text" id="hostTitle" placeholder="Title here..." />
			<button 
				className="btn waves-effect waves-light"
				onClick={() => {var title = document.getElementById('hostTitle').value; this.startSession(title)}}>
				Create a room
			</button>
		</div>
	)}
}