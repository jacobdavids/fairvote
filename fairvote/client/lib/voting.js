Template.vote.helpers({
  choices() {
  	return Session.get("currentChoices");
  },
  preferenceNumbers() {
    var numCurrentChoices = Session.get("currentChoices").length;
    var preferenceNumbers = [];
    for (var i = 1; i < (numCurrentChoices+1); i++) {
      preferenceNumbers.push(i);
    }
    return preferenceNumbers;
  },
  pollTypeIsFPTP() {
    return Session.get("currentPoll").pollType == "FPTP";
  },
  pollTypeIsAPRV() {
    return Session.get("currentPoll").pollType == "APRV";
  },
  pollTypeIsAV() {
    return Session.get("currentPoll").pollType == "AV";
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

    // Store votes selected by user on voting form
    var votes = [];
    // Check poll type
    if (currentPoll.pollType == "FPTP") {
      // First past the post poll (preferences are only relevant for alternative polls)
      votes.push({choice: target.choice.value, preference: ''});
    } else if (currentPoll.pollType == "APRV") {
      // Approval poll
      for (var i=0; i < target.choice.length; i++) {
        if (target.choice[i].checked) {
          votes.push({choice: target.choice[i].value, preference: ''});
          target.choice[i].checked = false;
        } else {
          votes.push({choice: '', preference: ''});
        }
      }
    } else if (currentPoll.pollType == "AV") {
      // Alternative poll
      // Get preferences from select inputs, use same index to get choices form hidden input fields
      for (var i=0; i < target.preference.length; i++) {
        if (target.preference[i].value) {
          votes.push({choice: target.choice[i].value, preference: target.preference[i].value});
          target.preference[i].value = '';
        } else {
          votes.push({choice: '', preference: target.preference[i].value});
        }
      }
    }  

    // Submit vote for each choice selected by user
    submitVotes(poll, votes);

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