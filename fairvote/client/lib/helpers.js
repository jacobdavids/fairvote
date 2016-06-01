countVotes = function(choices, rawBallots) {
  var countedVotes = [];
  // Get current poll stored in session
  var currentPoll = Session.get("currentPoll");

  // Loop through each choice for poll
  choices.forEach( function (choice) {
    var numVotes = 0;
    rawBallots.forEach( function (rawBallot) {
      var ballot = JSON.parse(rawBallot.votes);
      ballot.forEach( function (vote) {
        // Counting style is dependant on poll type
        if ((currentPoll.pollType == "ALTR") && (choice == vote.choice) &&
            (vote.preference == "1")) {
          // For alternative polls, only count votes that are marked as first preference
          numVotes += 1;
        } else if ((currentPoll.pollType != "ALTR") && (choice == vote.choice)) {
          // For other polls, count all valid choices as votes
           numVotes += 1;
         }
      });
    });
    // Add count of votes for each choice to array
    countedVotes.push({choice: choice, numVotes: numVotes});
  });

  return countedVotes;
}

getWinnerAV = function () {
  // Get current poll from session
  var currentPoll = Session.get("currentPoll");

  // Initialise variables
  var winner = false;
  var tie = false;
  var winningChoice;

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

  // Repeat alternative vote counting method until winner is found
  while(!winner && !tie) {
    // Count total first preference votes
    totalFirstVotes = 0;
    votes.forEach( function (vote) {
      if ((vote.choice != "") && (vote.preference == "1")) {
        totalFirstVotes += 1;
      }
    });

    var choices = JSON.parse(currentPoll.choices);
    var countedVotes = countVotes(choices, currentPoll.rawBallots);

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
    return winningChoice;
  }
  // Return false if there was a tie
  return false;
}

getWinnerMaxVotes = function() {
  var countedVotes = Session.get("countedVotes");
  var maxVotes = 0;
  var winningChoice = false;

  if (countedVotes){
    // Get winner with max votes
    countedVotes.forEach( function (countedVote) {
      // Check for tie
      if (countedVote.numVotes == maxVotes) {
        winningChoice = false;
      }
      if (countedVote.numVotes > maxVotes) {
        maxVotes = countedVote.numVotes;
        winningChoice = countedVote.choice;
      }
    });
  }
  return winningChoice;
}
