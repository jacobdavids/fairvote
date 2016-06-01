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

    // Insert a poll into the collection
    var pollID = Polls.insert({
      title: title,
      pollType: pollType,
      choices: choices,
      maxVoters: maxVoters,
      finishDate: finishDate,
      active: true,
      owner: Session.get("currentEthAccount"),
      voters: [],
      rawBallots: [],
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
