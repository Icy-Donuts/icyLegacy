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
    console.log('hello!');
    var currentRoom;
    var self = this;
    socket.on('enterRoom', function(roomName, canvas) {
      window.roomName = roomName;
      window.canvas = canvas;
      window.location.href = '#/drawing';
      socket.removeListener('allRooms');
    });

    socket.emit('getRooms');

    socket.on('allRooms', function(rooms) {
      this.setState({rooms: rooms});
    }.bind(this));

    socket.on('joined', function(didJoin, roomName, canvas) {
      if (didJoin) {
        window.roomName = roomName;
        window.location.href = '#/drawing';
        window.canvas = canvas;
        socket.removeListener('allRooms');
      } else {
        console.log('That room does not exist');
      }
    });
  }

  startSession(host) {
    socket.emit('createRoom', host);
    document.getElementById('hostTitle').value = '';
  }

  joinRoom(roomName) {
    socket.emit('joinRoom', roomName);
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
    )
  }
}
