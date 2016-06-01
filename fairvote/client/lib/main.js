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

Template.body.onCreated(function bodyOnCreated() {
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

  // Run function to observe Polls collection
  observePolls();
});

Template.body.helpers({
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
  'change .select-eth-account'(event) {
    var selectedEthAccount = EthAccounts.findOne({address: event.target.value})
    Session.set("currentEthAccount", selectedEthAccount);
  },
});
