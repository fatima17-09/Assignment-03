//this is our javascript web server
const express = require("express");       //require == #include
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require('socket.io')(server);

const LISTEN_PORT = 8080;           //default port 80
const ABS_STATIC_PATH = __dirname + '/public';

//set our routes
app.get('/', function (req, res) {
  res.sendFile('index.html', { root: ABS_STATIC_PATH });
});

server.listen(LISTEN_PORT);                         //starts server
app.use(express.static(__dirname + '/public'));     //the client can access these files via http
console.log("Listening on port: " + LISTEN_PORT);   //a console output so we know something is happening

// Serve static files
app.use(express.static('public'));


let objectsFound = {}; //to keep track of the tressure that was found

io.on('connection', socket => {
  console.log('A user connected!');

  /* Code for the treassure hunt */
  socket.on('click', (boxId) => { //listen to click event and emit the unhide event to all players
    console.log(`Box ${boxId} clicked`);
    io.emit('unhide', boxId);
  });

  socket.on('gameOver', () => { //listen for game over event and emit the gameWon to the client to show game won screen
    console.log('Game over!');
    io.emit('gameWon');
  });

  socket.on('timer', (timeRemaining) => { //recieve timer event and emit it back to clients to see the remaining time on screen
    io.emit('timer', timeRemaining);
  });

  //listen for the unhide event
  socket.on('unhide', (boxId) => {
    console.log('Received unhide event:', boxId);
    // check if box with ID was clicked and tressure found, set flag to true to prevent from finding tressure again
    if (!objectsFound[boxId]) {
      objectsFound[boxId] = true;
      io.emit('objectFound', boxId); //sends the event back to client to update UI
    }
  });

/* Code for the character race */

  socket.on('updatePosition', (data) => {
    //check if ID matches the predefined IDs ('dog', 'robot', 'frog'),update position and emit to all connected clients
    if (data.id === 'dog') { 
      dogPosition = data.position;
    } else if (data.id === 'robot') {
      robotPosition = data.position;
    } else if (data.id === 'frog') {
      frogPosition = data.position;
    }

    io.emit('updatePosition', { id: data.id, position: data.position });

    //listen for win event to send the lose screen for other players
    socket.on('win', () => {
      console.log('A client has won the game');
     
      socket.broadcast.emit('lose');
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

});

