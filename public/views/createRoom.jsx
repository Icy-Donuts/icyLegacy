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
		var idString = '/#' + socket.id;
		socket.on('enterRoom', function(roomName, roomObj) {
			window.roomName = roomName;
  		window.canvas = roomObj.canvas;
  		window.username = roomObj.users;
			window.host = true;
			window.location.href = '#/drawing';
  		socket.removeListener('allRooms');
		});


		socket.on('joined', function(didJoin, roomName, roomObj) {
			if (didJoin) {
				window.roomName = roomName;
				window.host = false;
				window.canvas = roomObj.canvas;
				window.username = roomObj.users;
				window.location.href = '#/drawing';
			} else {
				console.log('That room does not exist');
			}
		});
	}

	componentDidMount() {
		var self = this;
    socket.emit('getRooms');

    socket.on('allRooms', function(rooms) {
    	console.log('all rooms: ', rooms);
      self.setState({rooms: rooms});
    });
    $('#submitted').on('click',function(){
      // console.log('Submitted');
      setInterval(function(){
        $('#createPageButton').click()
      },2000);
    })
	}
	
	startSession(title, username) {
		socket.emit('createRoom', title, username);
		// document.getElementById('roomTitle').value = '';
	}

	joinRoom(roomName, username) {
		socket.emit('joinRoom', roomName, username);
		// document.getElementById('roomTitle').value = '';
	}

	render() {
		return (
		<div className="readyScreen valign">
		<input type="text" id="username" placeholder="Username here..." />
			<h3 className="tlt"> Join Rooom Session </h3>
      <ul> {this.state.rooms.map(function(room, index) {
        return(
          <li key={index} onClick={() => {var username = document.getElementById('username').value; this.joinRoom(room, username)}}>{room}</li>
        )
      }.bind(this))}
      </ul>	
			<h3 className="tlt"> Create Rooom Session </h3>
			<form id="filesender" action = "file_upload" encType="multipart/form-data" method = "Post">
         <input type="text" id="hostTitle" name="roomtitle" placeholder="Title here..." />
         <input type="file" name="video" ></input>
            <button type= "submit" id="submitted" className="btn waves-effect waves-light">Create a room with this video</button>
      </form>
			<input type="text" id="hostTitle" placeholder="Title here..." />
			<button 
				className="btn waves-effect waves-light"
				onClick={() => {var title = document.getElementById('hostTitle').value; var username = document.getElementById('username').value; this.startSession(title, username)}}>
				Create a room
			</button>
		</div>
	)}
}
