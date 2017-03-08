const ws = require('ws').Server;
const server = new ws({port: 4000});
const players = [];
const plays = [];

if (server) {
  console.log("Server listening on port 4000");
}

function calculateWinner(plays) {
  let winner = 0;
  if (plays[0] == plays[1]) {
    return -1;
  }
  if ((plays[0] == "rock" && plays[1] == "scissors") || (plays[0] == "scissors" && plays[1] == "paper") || (plays[0] == "paper" && plays[1] == "rock")) {
    winner = 1;
  } else {
    winner = 2;
  }
  return winner;
}

server.on('connection', (socket) => {
  console.log("Got a new connection!");
  socket.on('message', (message) => {
    console.log("Got a new message:", message);
    let msg = JSON.parse(message);
    if (msg.action == "JOIN") {
      if (players.length == 2) {
        let reject = {action: "REJECT"};
        socket.send(JSON.stringify(reject));
        return false;
      }
      players.push(socket);
      let payload = {action: "ASSIGN", number: players.length};
      socket.send(JSON.stringify(payload));
      if (players.length == 2) {
        let payload = {action: "ANNOUNCE", number: 2};
        players[0].send(JSON.stringify(payload));
      }
    }
    if (msg.action == "PLAY") {
      plays.push(msg);
      if (plays.length == 2) {
        let payload = { action: "RESULT", plays: [], winner: 0 };
        plays.forEach((play) => {
          payload.plays.push(play.choice);
        });
        payload.winner = calculateWinner(payload.plays);
        players.forEach((sock) => {
          sock.send(JSON.stringify(payload));
        });
      }
    }
    if (msg.action == "LEAVE") {
      if (msg.number == 1) {
        players.pop();
        plays.pop();
      }
      if (msg.number == 2) {
        if (players.length == 2) {
          players.shift();
          plays.shift();
        } else {
          [1, 2].forEach(() => {
            players.shift();
            plays.shift();
          });
        }
      }
    }
  });
  
  socket.on('close', (sock) => {
    console.log("Connection lost. # of players: ", players.length);
  });
});
