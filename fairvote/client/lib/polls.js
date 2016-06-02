import { Polls } from '../../imports/api/polls.js';

zeroPad = function(unit){
  // For values under 10, pad with a zero
  if (unit < 10) {
    return "0" + unit;
  }
  return unit;
}

Template.existingpolls.helpers({
  polls() {
    return Polls.find({});
  },
});

Template.poll.helpers({
  'canDeletePoll': function(owner) {
    if (owner) {
      // Polls can only be deleted by their owner (creator)
      return Session.get("currentEthAccount").address == owner.address
    }
  },
  voted() {
    // Prior to vote being integrated to blockchain
    if ($.inArray(Session.get("currentEthAccount").address, this.voted) > -1) {
      return true;
    }
    // When vote has been integrated to blockchain
    if ($.inArray(Session.get("currentEthAccount").address, this.voters) > -1) {
     return true;
    }
    return false;
  },
  maxVotersReached() {
    // Check if number of ballots has exceeded maximum voters
    if (this.rawBallots.length >= parseInt(this.maxVoters)) {
      // If poll still active, update to inactive
      if (this.active) {
        Polls.update(this._id, {
          $set: {
            active: false,
          },
        });
      }
      return true;
    }
    return false
  },
  numBallotsReceived() {
    return this.rawBallots.length;
  },
  pollIsActive() {
    // Update poll stored in session
    Session.set("currentPoll", this);

    if (this) {
      return this.active;
    }
  },
  'getPollStatus': function(bool) {
    if (bool) {
      return "Active";
    }
    return "Inactive";
  },
  'getFullPollTypeName': function(pollType) {
    if (pollType == "FPTP") {
      return "First past the post";
    } else if (pollType == "APRV") {
      return "Approval";
    } else if (pollType == "ALTR") {
      return "Alternative";
    }
  },
  pollFinishDateReached() {
    if ((this.finishDate - Date.now()) <= 0) {
      return true;
    }
    return false;
  },
  getFinishDate() {
    // Convert finish date string to date object
    var finishDate = new Date(this.finishDate);

    // Get date components
    var hour = finishDate.getHours().toString();
    var ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    hour = zeroPad(hour.toString());
    var minute = finishDate.getMinutes().toString();
    minute = zeroPad(minute.toString());
    var day = finishDate.getDate().toString();
    day = zeroPad(day.toString());
    var month = (finishDate.getMonth() + 1).toString();
    month = zeroPad(month.toString());
    var year = finishDate.getFullYear().toString();

    // Return date in readable format
    return hour + ":" + minute + ampm + " " + day + "/" + month + "/" + year;
  },
});

Template.poll.events({
  'click .delete-poll'(event) {
    // Check that delete button is not disabled
    if (!$(event.target).hasClass("disabled")) {
      // Get poll from blockchain
      var poll = web3.eth.contract(this.contract.abi).at(this.contract.address);

    	// Kill poll from blockchain
      poll.kill.sendTransaction({from: Session.get("currentEthAccount").address});

      // Remove poll from database
    	Polls.remove(this._id);
    	console.log("Poll deleted from blockchain");

      // Hide UI sections
      $(".vote-section").hide();
      $(".view-votes-section").hide();
    }
  },
  'click .vote-poll'(event) {
    // Check that delete button is not disabled
    if (!$(event.target).hasClass("disabled")) {
      // Get poll
      var poll = Template.instance().data;

      // Set session data
      Session.set("currentPoll", poll);

      // Hide/show UI sections
      $(".vote-section").show();
      $(".view-votes-section").hide();

      // Scroll to vote section
      var voteSection = $(".vote-section");
      $('html,body').animate({scrollTop: voteSection.offset().top},'slow');
    }
  },
  'click .view-poll'(event) {
    if (!$(event.target).hasClass("disabled")) {
      // Get poll
      var poll = Template.instance().data;

      // Set session data
      Session.set("currentPoll", poll);

      // Count votes
      var countedVotes = countVotes(poll.choices, poll.rawBallots);
      Session.set("countedVotes", countedVotes);

      // Hide/show UI sections
      $(".vote-section").hide();
      $(".view-votes-section").show();

      // Scroll to view votes section
      var viewVotesSection = $(".view-votes-section");
      $('html,body').animate({scrollTop: viewVotesSection.offset().top},'slow');
    }
  },
});
