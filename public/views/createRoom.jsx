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
		socket.on('enterRoom', function(roomName, canvas) {
			window.roomName = roomName;
  		window.canvas = canvas;
			window.host = true;
			window.location.href = '#/drawing';
      		socket.removeListener('allRooms');
		});

    socket.emit('getRooms');

    socket.on('allRooms', function(rooms) {
    	console.log('all rooms: ', rooms);
      this.setState({rooms: rooms});
    }.bind(this));

		socket.on('joined', function(didJoin, roomName, canvas) {
			if (didJoin) {
				window.roomName = roomName;
				window.host = false;
				window.canvas = canvas;
				window.location.href = '#/drawing';
			} else {
				console.log('That room does not exist');
			}
		})
	}

	
	startSession(title) {
		socket.emit('createRoom', {host:title});
		// document.getElementById('roomTitle').value = '';
	}

	joinRoom(roomName) {
		socket.emit('joinRoom', roomName);
		// document.getElementById('roomTitle').value = '';
	}

	render() {
		return (
		<div className="readyScreen valign">
			<h3 className="tlt"> Join Room Session </h3>
      <ul> {this.state.rooms.map(function(room, index) {
        return(
          <li key={index} onClick={() => {this.joinRoom(room)}}>{room}</li>
        )
      }.bind(this))}
      </ul>	
			<h3 className="tlt"> Create Room Session </h3>
			<input type="text" id="hostTitle" placeholder="Title here..." />
			<form action = "file_upload" encType="multipart/form-data" method = "Post">
				<div id="fileSize"></div>
				<div id="fileType"></div>
				<div id="progress"></div>
				 <input type="file" name="video" ></input>
					<button type= "submit">Submit</button>
			</form>
			<button 
				className="btn waves-effect waves-light"
				onClick={() => {var title = document.getElementById('hostTitle').value; 

				this.startSession(title)}}>
				Create a room
			</button>
		</div>
	)}
}
