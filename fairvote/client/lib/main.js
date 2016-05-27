import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'
import { Polls } from '../../imports/api/polls.js';

import '../templates/main.html';

Meteor.startup(function () {
    _.extend(Notifications.defaultOptions, {
        timeout: 5000
    });
});

countVotes = function(choices, votes) {
  var countedVotes = [];
  // Check if choices exist
  if (choices) {
    // Get current poll stored in session
    var currentPoll = Session.get("currentPoll");
    
    // Loop through each choice for poll
    choices.forEach( function (choice) {
      // Count votes for each choice
      var numVotes = 0;
      votes.forEach( function (vote) {
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
      // Add count of votes for each choice to array
      countedVotes.push({choice: choice, numVotes: numVotes});
    });
    return countedVotes;
  }
}

validatePollForm = function(target) {
  // Check title is valid
  var title = target.title.value;
  if (title == "") {
    Notifications.error('Error', 'Poll title cannot be empty. Please enter a poll title.');
    return false;
  }

  // Check poll type is valid
  var pollType = target.pollType.value;
  if (pollType == "") {
    Notifications.error('Error', 'Poll type cannot be empty. Please select a poll type.');
    return false;
  }

  // Check if choice fields are valid
  var numChoiceFields = Session.get("choiceFields");
  var choiceFields = target.children.item(2).children;
  for (var i=0; i < choiceFields.length; i+=1) {
    if (choiceFields[i].value == "") {
      Notifications.error('Error', 'Choices cannot be empty. Please enter text for each choice.');
      return false;
    }
  }

  // Check maximum voters is valid
  var maxVoters = target.maxVoters.value;
  if (maxVoters == "") {
    Notifications.error('Error', 'Maximum voters cannot be empty. Please enter a value for maximum voters.');
    return false;
  }
  if (maxVoters == "0") {
    Notifications.error('Error', 'Maximum voters cannot be zero. Please enter a positive value for maximum voters.');
    return false;
  }

  // Check finish date is valid
  var finishDate = target.finishDate.value;
  if (finishDate == "") {
    Notifications.error('Error', 'Finish date cannot be empty. Please select a finish date.');
    return false;
  }

  return true;
}

Template.body.onCreated(function bodyOnCreated() {
  // init reactive variables
  this.polls = new ReactiveVar([]);

  // Set session variable for number of choice fields to display
  Session.set("choiceFields", 2);

  // Initialise ethereum accounts & blocks packages
  EthAccounts.init();
  EthBlocks.init();

  // Set main account (Etherbase) as current account
  var currentEthAccount = EthAccounts.findOne({name: "Main account (Etherbase)"});
  // Check if ethereum account exists
  if (currentEthAccount) {
    // Set current account in session
    Session.set("currentEthAccount", currentEthAccount)
    $(".select-eth-account").value = currentEthAccount.address;
  }

  observePolls();
});

Template.body.helpers({
  polls() {
    return Polls.find({});
  },
  accounts() {
    return EthAccounts.find({});
  },
  currentEthAccount() {
    return Session.get("currentEthAccount");
  },
  latestEthBlock() {
    return EthBlocks.latest;
  },
});

Template.body.events({
  // Create new poll
  'submit .new-poll'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get target (form)
    const target = event.target;

    // Check if form is valid
    var valid = validatePollForm(target);
    if (!valid) {
      return;
    }

    // Get input poll data from target
    const title = target.title.value;
    const pollType = target.pollType.value;
    const maxVoters = target.maxVoters.value;
    var maxVotes = 0;
    const finishDate = Date.parse(target.finishDate.value);

    // Get number of choice fields from session variable
    var numChoiceFields = Session.get("choiceFields");
    var choiceFields = target.children.item(2).children;
    var choices = [];
    for (var i=0; i < choiceFields.length; i+=1) {
    	choices.push(choiceFields[i].value);
    }
    // Convert choices array to string for storage in contract
    choices = JSON.stringify(choices);

    // Calculate max votes for poll
    if (pollType == "FPTP") {
      maxVotes = maxVoters;
    } else if ((pollType == "APRV") || (pollType == "ALTR")) {
      maxVotes = numChoiceFields*parseInt(maxVoters);
      maxVotes = maxVotes.toString();
    }

    // Insert a poll into the collection
    var pollID = Polls.insert({
      title: title,
      pollType: pollType,
      choices: choices,
      maxVotes: maxVotes,
      maxVoters: maxVoters,
      finishDate: finishDate,
      active: true,
      voters: [],
      voted: [],
      votes: [],
      createdAt: new Date(), // current time
    });

    // Get created poll
    poll = Polls.findOne(pollID);

    // Set timer for finish date of poll on server
    Meteor.call('updateFinishDateTimer', poll, function (error, result) {});
 
    // Clear form
    target.title.value = '';
    target.pollType.value = '';
    target.pollType.style.color = "#999";
    for (var i=0; i < choiceFields.length; i++) {
    	choiceFields[i].value = '';
    }
    target.maxVoters.value = '';
    target.finishDate.value = '';

    // Reset number of choice fields to 2
    while (numChoiceFields > 2) {
      $('.poll-choices').children()[numChoiceFields-1].remove();
      numChoiceFields -= 1;
    }
    Session.set("choiceFields", numChoiceFields);

    // Hide UI sections
    $(".vote-section").hide();
    $(".view-votes-section").hide();

    Notifications.info('Info', 'Your poll is waiting to be mined.');
  },
  'click .add-choice'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Update number of choice fields in session variable
    var numChoiceFields = Session.get("choiceFields");
    numChoiceFields += 1;
    Session.set("choiceFields", numChoiceFields)
    $('.poll-choices').append("<input type='text' class='form-control' name='choice" + numChoiceFields + "' placeholder='Poll Choice " + numChoiceFields + "' />");
  },
  'click .remove-choice'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Update number of choice fields in session variable
    var numChoiceFields = Session.get("choiceFields");
    if (numChoiceFields > 2) {
      $('.poll-choices').children()[numChoiceFields-1].remove()
      numChoiceFields -= 1;
      Session.set("choiceFields", numChoiceFields)
    }
  },
  'change .select-poll-field'(event) {
    event.target.style.color = "#555";
  },
  'change .select-eth-account'(event) {
    var selectedEthAccount = EthAccounts.findOne({address: event.target.value})
    Session.set("currentEthAccount", selectedEthAccount);
  },
});
