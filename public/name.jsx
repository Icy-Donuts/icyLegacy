import React from 'react'

//the starting view shown when you load the game

export default class Name extends React.Component {
	constructor(props) {
		super(props)
	}

	sendName(player) {
		socket.emit('name', player)
	}

	componentWillMount() {
		socket.on('readyView', function () {
			window.location.href = '#/ready'
		});
	}



	render() {
		return (
				<div className="user-register z-depth-1 valign">
					<input type='text' id='player' placeholder='stumpy the kitty' />
					<button className="btn waves-effect waves-light" value='Submit' onClick={function () {this.sendName(document.getElementById('player').value)}.bind(this)}>
                      submit
					</button>

				</div>



			)
	}
}

