Template.viewvotes.helpers({
  countedVotes() {
    // Get counted votes array from session data
    return Session.get("countedVotes");
  },
  poll() {
    return Session.get("currentPoll");
  },
  pollIsActive() {
    if (Session.get("currentPoll")) {
      return Session.get("currentPoll").active;
    }
  },
  winner() {
    var currentPoll = Session.get("currentPoll");
    if (!currentPoll) return;

    // Get winner for poll
    var winner;
    if (currentPoll.pollType == "ALTR") {
      // Calculate winner using alternative vote methodology
      winner = getWinnerAV();
    } else {
      // Calculate winner from number of max votes
      winner = getWinnerMaxVotes();
    }

    return winner;
  },
  votes() {
    var currentPoll = Session.get("currentPoll");

    // Loop through raw ballots and create an array of vote objects
    // Each vote object consists of: choice, preference & sender
    var votes = [];
    currentPoll.rawBallots.forEach( function (rawBallot) {
        var ballot = JSON.parse(rawBallot.votes);
        var sender = rawBallot.sender;
        ballot.forEach( function (vote) {
          vote['sender'] = sender;
          votes.push(vote);
        });
    });

    return votes;
  }
});