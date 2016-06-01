Template.viewvotes.helpers({
  votes() {
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
});