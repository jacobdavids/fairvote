Template.vote.helpers({
  choices() {
  	return Session.get("currentChoices");
  },
  pollTypeIsFPTP() {
    return Session.get("currentPoll").pollType == "FPTP";
  },
  pollTypeIsAPRV() {
    return Session.get("currentPoll").pollType == "APRV";
  },
});

Template.vote.events({
  // Submit vote on poll
  'submit .vote-on-poll': function(event, template) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get target
    const target = event.target;
 
    // Get current poll
    var currentPoll = Session.get("currentPoll");

    // Get selected address
    var address = currentPoll.contract.address;

    // Get poll from address
    var poll = web3.eth.contract(currentPoll.contract.abi).at(address);

    // Store choices selected by user
    var choices = [];
    // Check poll type
    if (currentPoll.pollType == "FPTP") {
      choices.push(target.choice.value);
    } else if (currentPoll.pollType == "APRV") {
      for (var i=0; i < target.choice.length; i++) {
        if (target.choice[i].checked) {
          choices.push(target.choice[i].value);
          target.choice[i].checked = false;
        } else {
          choices.push('');
        }
      }
    }

    // Submit vote for each choice selected by user
    submitVotes(poll, choices);

    // Notify user their vote has been received
    Notifications.info('Info', 'Your vote is waiting to be mined.');

    // Get vote events from blockchain for this poll
   	getVoteEvents();

    // Count votes
    var choices = Session.get("currentChoices");
    var votes = Session.get("currentPoll").votes;
    var countedVotes = countVotes(choices, votes);
    // Store counted votes in session data
    Session.set("countedVotes", countedVotes);

    // Set session data
    Session.set("currentChoices", JSON.parse(currentPoll.choices));
    $(".vote-section").hide();
    $(".view-votes-section").show();
  },
});

Template.viewvotes.helpers({
  votes() {
    // Get counted votes array from session data
    return Session.get("countedVotes");
  },
  poll() {
    return Session.get("currentPoll");
  },
  pollIsActive() {
    var currentPoll = Session.get("currentPoll");
    if (currentPoll) {
      if (currentPoll.contract) {
        // Get poll
        var poll = web3.eth.contract(currentPoll.contract.abi).at(currentPoll.contract.address);

        // Get if poll is active
        var pollIsActive = poll.p()[7];

        return pollIsActive;
      }
    }
  },
  winner() {
    var countedVotes = Session.get("countedVotes");
    var maxVotes = 0;
    var winner = false;
    if (countedVotes){
      countedVotes.forEach( function (countedVote) {
        if (countedVote.numVotes == maxVotes) {
          winner = false;
        }
        if (countedVote.numVotes > maxVotes) {
          maxVotes = countedVote.numVotes;
          winner = countedVote.choice;
        }
      });
    }
    return winner;
  },
});