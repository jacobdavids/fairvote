import { Polls } from '../../imports/api/polls.js';

Template.createpoll.onRendered(function () {
  // Initiate datetime picker
  $('.datetimepicker').datetimepicker({
    allowInputToggle: true,
  });
});

Template.poll.helpers({
  'canDeletePoll': function(account) {
    if (account) {
      return Session.get("currentEthAccount").address == account.address
    }
  },
  voted() {
    if ($.inArray(Session.get("currentEthAccount").address, this.voters) > -1) {
     return true;
    }
    return false;
  },
  maxVotesReached() {
    // Check if number of votes has exceeded maximum votes
    if (this.votes.length >= parseInt(this.maxVotes)) {
      return true;
    }
    return false
  },
  numBallotsReceived() {
    return this.voters.length;
  },
  pollIsActive() {
    if (this.contract) {
      // Get poll
      var poll = web3.eth.contract(this.contract.abi).at(this.contract.address);

      // Get if poll is active
      var pollIsActive = poll.p()[7];

      return pollIsActive;
    }
  },
  'getPollStatus': function(bool) {
    if (bool) {
      return "Active";
    }
    return "Inactive";
  },
});

Template.poll.events({
  'click .delete-poll'() {
    // Get poll from blockchain
    var poll = web3.eth.contract(this.contract.abi).at(this.contract.address);

  	// Kill poll from blockchain
    poll.kill.sendTransaction({from: Session.get("currentEthAccount").address});

    // Remove poll from database
  	Polls.remove(this._id);
  	console.log("Poll deleted from blockchain");
  },
  'click .vote-poll'() {
    // Get poll
    var poll = Template.instance().data;
    var pollChoices = JSON.parse(poll.choices);

    // Set session data
    Session.set("currentPoll", poll);
    Session.set("currentChoices", pollChoices);

    // Hide/show UI sections
    $(".vote-section").show();
    $(".view-votes-section").hide();

    // Scroll to vote section
    var voteSection = $(".vote-section");
    $('html,body').animate({scrollTop: voteSection.offset().top},'slow');
  },
  'click .view-poll'() {
    // Get poll
    var poll = Template.instance().data;
    var pollChoices = JSON.parse(poll.choices);

    // Set session data
    Session.set("currentPoll", poll);
    Session.set("currentChoices", pollChoices);

    // Count votes
    var countedVotes = countVotes(pollChoices, poll.votes);
    Session.set("countedVotes", countedVotes);

    // Hide/show UI sections
    $(".vote-section").hide();
    $(".view-votes-section").show();

    // Scroll to view votes section
    var viewVotesSection = $(".view-votes-section");
    $('html,body').animate({scrollTop: viewVotesSection.offset().top},'slow');
  },
});