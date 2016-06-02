Template.viewvotes.helpers({
  countedVotes() {
    return Session.get("countedVotes");
  },
  poll() {
    return Session.get("currentPoll");
  },
  pollIsActive() {
    var currentPoll = Session.get("currentPoll");
    if (!currentPoll) return;

    return currentPoll.active;
  },
  winner() {
    var currentPoll = Session.get("currentPoll");
    if (!currentPoll) return;

    // Calculate winner for poll
    var winner;
    if (currentPoll.pollType == "ALTR") {
      // Calculate winner using alternative vote methodology
      winner = getWinnerALTR();
    } else {
      // Calculate winner from number of max votes
      winner = getWinnerMaxVotes();
    }

    return winner;
  },
  votes() {
    var currentPoll = Session.get("currentPoll");
    if (!currentPoll) return;

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