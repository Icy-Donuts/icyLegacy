var Drawing = require('./Drawing');

exports.addDrawing = function (drawing) {
  var newDrawing = new Drawing ({
    playerName: drawing.playerName,
    roundId: drawing.roundId,
    vectorDrawing: drawing.vectorDrawing,
    voteCount: 0
  }).save(function (err) {
    if (err) {
      console.log(err);
    }
  });
};

exports.retrieveRoundsDrawings = function (round, cb) {
  console.log('receiving getReq @ this endpoint!');
  Drawing.find({roundId: round}, function (err, drawing) {
    if (err) {
      console.log(err);
    } else {
      cb(drawing);
    }
  }).sort({voteCount:-1});
};

exports.updateVoteCount = function (rounds, name, cb) {
  console.log('operating on user', name);
  Drawing.update({roundId: rounds, playerName: name}, {$inc: {voteCount: 1} }, function (err, drawing) {
    if (err) {
      console.log(err);
    } else {
      cb(drawing);
      console.log('RESULT AFTER UDPATE IS', drawing);
      console.log('AND THIS WAS INCREMENTED IN ROUND', rounds, 'FOR PLAYER', name);
    }
  });
};
