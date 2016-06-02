import { Polls } from '../../imports/api/polls.js';

Template.vote.helpers({
  choices() {
    var currentPoll = Session.get("currentPoll");
    if (!currentPoll) return;

  	return currentPoll.choices;
  },
  preferenceNumbers() {
    var currentPoll = Session.get("currentPoll");
    var numChoices = currentPoll.choices.length;

    // Make array of available preference numbers for alternative vote ballots
    var preferenceNumbers = [];
    for (var i = 1; i < (numChoices+1); i++) {
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
  pollTypeIsALTR() {
    return Session.get("currentPoll").pollType == "ALTR";
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

      // Check if form is valid
      var valid = validateFPTPPoll(target);
      if (!valid) return;

      votes.push({choice: target.choice.value, preference: ''});
    } else if (currentPoll.pollType == "APRV") {
      // Approval poll

      // Check if form is valid
      var valid = validateAPRVPoll(target);
      if (!valid) return;

      for (var i=0; i < target.choice.length; i++) {
        if (target.choice[i].checked) {
          votes.push({choice: target.choice[i].value, preference: ''});
          target.choice[i].checked = false;
        } else {
          votes.push({choice: '', preference: ''});
        }
      }
    } else if (currentPoll.pollType == "ALTR") {
      // Alternative poll

      // Check if form is valid
      var valid = validateALTRPoll(target);
      if (!valid) return;

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

    // Add sender address to poll to ensure they can not vote again
    Polls.update(currentPoll._id, {
      $push: {
        voted: Session.get("currentEthAccount").address,
      },
    });

    // Notify user their vote has been received
    Notifications.info('Info', 'Your vote is waiting to be mined.');

    // Get vote events from blockchain for this poll
   	getVoteEvents();

    // Count votes
    var currentPoll = Session.get("currentPoll");
    var countedVotes = countVotes(currentPoll.choices, currentPoll.rawBallots);

    // Store counted votes in session data
    Session.set("countedVotes", countedVotes);

    // Hide/show UI sections
    $(".vote-section").hide();
    $(".view-votes-section").show();
  },
});
