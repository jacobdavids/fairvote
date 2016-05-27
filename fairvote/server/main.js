import { Meteor } from 'meteor/meteor';
import { Polls } from '../imports/api/polls.js';

web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8080'));

Meteor.startup(() => {

	// Code to run on server at startup

	// Get all active polls
	var activePolls = Polls.find({active:true}).fetch();

	// Iterate through active polls and update timer to poll finish date
    activePolls.forEach( function (activePoll) {
    	if (activePoll.finishDate - Date.now() <= 0) {
    		// Finish date reached, update poll to inactive
    		Polls.update(activePoll._id, {
		      $set: {
		        active: false,
		      },
		    });
    	} else {
    		// Otherwise update timer to finsh date
    		Meteor.call('updateFinishDateTimer', activePoll, function (error, result) {});
    	}    
    });

  	return Meteor.methods({
  		// Will update timer to render polls inactive when finish date has been reached
	  	updateFinishDateTimer: function (poll) {
	  		// Set timer to countdown till finish date for poll
	  		Meteor.setTimeout(function() {
			    // Update poll to inactive
			    Polls.update(poll._id, {
			      	$set: {
			      		active: false,
			      	}
			    });
			}, (poll.finishDate - Date.now()));
	  	}
    });
});

