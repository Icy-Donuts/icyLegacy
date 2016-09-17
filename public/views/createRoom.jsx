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
// AWS get sign request for file
  //getSignedRequest(file) {
    //const xhr = new XMLHttpRequest();
    //xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
    //xhr.onreadystatechange = () => {
      //if (xhr.readyState === 4) {
        //if (xhr.status === 200) {
          //const response = JSON.parse(xhr.responseText);
          //uploadFile(file, response.signedRequest, response.url);
        //}
        //else {
          //console.log('Could not get signed url.');
        //}
      //}
    //};
    //xhr.send();
  //}
//// Uploads file to AWS once the request is signed
  //uploadFile(file, signedRequest, url) {
    //const xhr = new XMLHttpRequest();
    //xhr.open('PUT', signedRequest);
    //xhr.onreadystatechange = () => {
      //if (xhr.readyState === 4) {
        //if (xhr.status === 200) {
          //document.getElementBeId('file').value=url;
        //}
        //else {
          //console.log('Could not upload file.');
        //}
      //}
    //}
    //xhr.send(file);
  //}

	render() {
		return (
    <div>
		  <div className="card card-wide">
        <div className="inline-input-container">
          <h3 className="tlt">Your name:</h3>
          <input type="text" className="inline-input" id="username" />
        </div>
      </div>
      <div className="section">
        <div className="card card-medium">
			    <h3 className="tlt">Join a room:</h3>
          <ul
            className="room-list">
            {this.state.rooms.map(function(room, index) {
            return(
              <li
                className="room-list-items"
                key={index}
                onClick={() => {
                  var username = document.getElementById('username').value;
                  this.joinRoom(room, username);
                  }}>
                <i className="material-icons circle-icon">arrow_forward</i>
                <span>{room}</span>
              </li>
            )
          }.bind(this))}
          </ul>
        </div>
        <div className="card card-medium">
			    <h3
            className="tlt">
            Create a room:
          </h3>
			    <form id="filesender"
            action = "file_upload"
            encType="multipart/form-data"
            method = "Post">
			    <input
            className="block-input"
            type="text"
            name="roomtitle"
            id="hostTitle"
            placeholder="Title here..." />
          <div className="duo-button-container">
          <label
            className="form-label-icon"
            htmlFor="file">
            <i className="material-icons">file_upload</i>
            upload file
          </label>
          <input
            hidden
            id="file"
            type="file"
            //onChange={()=> {
              //const files = document.getElementById('file').files;
              //const file = files[0];
              //if (file === null) {
                //return alert('No file selected');
              //}
              //this.getSignedRequest(file);
            //}};
            name="video" />
              <button
                type= "submit"
                id="submitted"
                className="button-cta">
                Create room
              </button>
            </div>
          </form>
          <button>
               Stream
          </button>
          <button
            hidden
            id="createPageButton"
            onClick={() => {
              var title = document.getElementById('hostTitle').value;
              var username = document.getElementById('username').value;
              this.startSession(title, username);
            }}>
          </button>
		    </div>
      </div>
    </div>
	)}
}
