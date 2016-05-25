getWinnerAV = function () {
  var currentPoll = Session.get("currentPoll");
  var winner = false;
  var tie = false;
  var winningChoice;
  // var FAKEVOTEDATA = [];
  var votes = currentPoll.votes;

  // Repeat alternative vote counting method until winner is found
  while(!winner && !tie) {
    // Count total first preference votes
    totalFirstVotes = 0;
    votes.forEach( function (vote) {
      if ((vote.choice != "") && (vote.preference == "1")) {
        totalFirstVotes += 1;
      }
    });

    var choices = Session.get("currentChoices");
    // var choices = ["A", "B", "C", "D"];
    var countedVotes = countVotes(choices, votes);

    // Find choice that has maximum first preference votes
    var maxFirstVotes = 0;
    var maxFirstVotesChoice;
    countedVotes.forEach( function (countedVote) {
      if (countedVote.numVotes > maxFirstVotes) {
        maxFirstVotes = countedVote.numVotes;
        maxFirstVotesChoice = countedVote.choice;
      }
    });
    // Check if we have a winner (a choice has over 50% of first preference votes)
    if (maxFirstVotes > (totalFirstVotes/2)) {
      // We have a winner
      winner = true;
      winningChoice = maxFirstVotesChoice;
    } 

    // Check if we don't have a winner
    if (!winner) {
      // Find losing choice (one with least first preference votes)
      var minFirstVotes = maxFirstVotes;
      tie = true;
      countedVotes.forEach( function (countedVote) {
        if ((countedVote.numVotes < minFirstVotes) && (countedVote.numVotes != 0)) {
          minFirstVotes = countedVote.numVotes;
          tie = false;
        }
      });

      // Get all losing choices (there may be more than one)
      var minFirstVotesChoices = [];
      countedVotes.forEach( function (countedVote) {
        if (countedVote.numVotes == minFirstVotes) {
          minFirstVotesChoices.push(countedVote);
        }
      });

      // Eliminate losing choice/s and transfer votes to second preference
      var senderAddresses = [];
      minFirstVotesChoices.forEach( function (minFirstVotesChoice) {
        votes.forEach( function (vote) {
          if ((vote.choice == minFirstVotesChoice.choice) && (vote.preference == "1")) {
            // Replace eliminated choice/s first preference with empty string
            vote.preference = "";
            // Store sender addresses for users that voted for eliminated choice/s
            senderAddresses.push(vote.sender);
          }
        });
      });

      // For all users that voted for eliminated choice, shift other preferences on ballot down one
      votes.forEach( function (vote) {
        // Check if vote belongs to user that voted for eliminated choice and vote preference is not empty
        if (($.inArray(vote.sender, senderAddresses) > -1) && (vote.preference != "")) {
          var preference = parseInt(vote.preference);
          preference -= 1;
          vote.preference = preference.toString();
        }
      });
    }
  }

  // Check that there was not a tie
  if (!tie) {
    // Return winning choice
    console.log("WINNER IS: " + winningChoice);
    return winningChoice;
  }
  // Return false if there is a tie
  console.log("TIE! THERE IS NO WINNER");
  return false;
}

getWinnerMaxVotes = function() {
  var countedVotes = Session.get("countedVotes");
  var maxVotes = 0;
  var winningChoice = false;
  if (countedVotes){
    countedVotes.forEach( function (countedVote) {
      if (countedVote.numVotes > maxVotes) {
        maxVotes = countedVote.numVotes;
        winningChoice = countedVote.choice;
      }
    });
  }
  return winningChoice;
}

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
    var currentPoll = Session.get("currentPoll");
    if (!currentPoll) return;

    // Get winner for poll
    var winner;
    if (currentPoll.pollType == "AV") {
      // Calculate winner using alternative vote methodology
      winner = getWinnerAV();
    } else {
      // Calculate winner from number of max votes
      winner = getWinnerMaxVotes();
    }

    return winner;
  },
});