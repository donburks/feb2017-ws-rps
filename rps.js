$(function() {
  const socket = new WebSocket("ws://localhost:4000");
  const showControls = () => $("#options").show();
  const closeSocket = () => {
    let payload = {action: "LEAVE", number: playerNumber};
    socket.send(JSON.stringify(payload));
    socket.close();
  };
  let playerNumber = null;
  
  socket.onopen = () => {
    console.log("Got connected to server.");
    let payload = {action: "JOIN"};
    socket.send(JSON.stringify(payload));
  };

  socket.onmessage = (msg) => {
    let message = JSON.parse(msg.data); 
    if (message.action == "REJECT") {
      alert("You have been rejected. Try again later.");
      socket.close();
    }
    if (message.action == "ASSIGN") {
      playerNumber = message.number;
      $("#playerNum").text(message.number);
      if (message.number == 2) {
        showControls();
      }
    } 
    if(message.action == "ANNOUNCE") {
      alert(`Player ${message.number} has joined the game.`);
      if (message.number == 2) {
        showControls();
      }
    }
    if(message.action == "RESULT") {
      $("#options").hide();
      if (message.winner == -1) {
        $("<p>").text("It was a draw. Try again.").addClass('red').appendTo("body");
      } else {
        $("<p>").text(`Player 1 played ${message.plays[0]}`).appendTo("body");
        $("<p>").text(`Player 2 played ${message.plays[1]}`).appendTo("body");
        $("<h1>").text("Winner is player " + message.winner).appendTo("body");
      }
      closeSocket();
    }
  };

  $("#options").find('img').on('click', function() {
    let payload = {action: "PLAY", number: playerNumber, choice: $(this).data('play') };
    socket.send(JSON.stringify(payload));
    $(this).addClass('active');
    $("#options img").off('click');
  });
});
