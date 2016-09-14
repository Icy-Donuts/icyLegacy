
//BIG NOTE:  We only used react router to setup routes.  We move from view to view using window.location.href


import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import Name from './name.jsx'
import CreateRoom from './views/createRoom.jsx'
import Drawing from './views/drawing.jsx'
import Result from './views/result.jsx'
import Vote from './views/vote.jsx'

render((
  <Router history={hashHistory}>
    <Route path="/" component={CreateRoom}/>
    <Route path="/drawing" component={Drawing}/>
    <Route path="/vote" component={Vote}/>
    <Route path="/result" component={Result}/>
  </Router>
), document.getElementById('app'))
