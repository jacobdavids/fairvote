import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'
import { Polls } from '../imports/api/polls.js';
import { Votes } from '../imports/api/votes.js';

import './templates/main.html';

Meteor.startup(function () {
    _.extend(Notifications.defaultOptions, {
        timeout: 5000
    });
});

function getVoteEvents() {
	// Get current poll
  var currentPoll = Session.get("currentPoll");

  // Get selected address
  var address = currentPoll.contract.address;

  // Get poll from address
	var poll = web3.eth.contract(currentPoll.contract.abi).at(address);

	// Count votes for the poll now
 	var startBlock = web3.eth.getTransaction(currentPoll.contract.transactionHash).blockNumber;
	var filter = poll.Vote(
		{}, 
		{
			fromBlock: startBlock, 
			toBlock: 'latest'
		},
		function(err, result) {
			if (!err) {
				var currentVotes = Session.get("voteEvents");
				currentVotes.push(result);
				Session.set("voteEvents", currentVotes);
				console.log(result.args.choice);
			} 
	});
}

Template.body.onCreated(function bodyOnCreated() {
  // init reactive variables
  this.polls = new ReactiveVar([]);

  // Set session variable for number of choice fields to display
  Session.set("choiceFields", 2);

  // Initialise ethereum accounts package
  EthAccounts.init();

  // Set main account (Etherbase) as current account
  var currentEthAccount = EthAccounts.findOne({name: "Main account (Etherbase)"});
  Session.set("currentEthAccount", currentEthAccount)
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
});

Template.body.events({
  // Create new poll
  'submit .new-poll'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get input poll data
    const target = event.target;
    const title = target.title.value;
    const pollType = target.polltype.value;
    const maxVotes = target.maxVotes.value;
    // Get number of choice fields from session variable
    var numChoiceFields = Session.get("choiceFields");
    var choiceFields = target.children.item(2).children;
    var choices = [];
    for (var i=0; i < choiceFields.length; i+=1) {
    	choices.push(choiceFields[i].value);
    }
 	  choices = JSON.stringify(choices);
    // Insert a poll into the collection
    var pollID = Polls.insert({
      title: title,
      pollType: pollType,
      choices: choices,
      maxVotes: maxVotes,
      createdAt: new Date(), // current time
    });
	// create a new poll when button is clicked
  console.log("Initialising contract...");
	var _title = title;
  var _pollType = pollType;
	var _choices = choices;
	var _maxVotes = maxVotes;
	var _finishDate = '146304148900';
	var pollContract = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "pollType", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "deactivatePoll", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_pollType", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }], name: "Vote", type: "event" }]);
	var poll = pollContract.new(
		_title,
    _pollType,
		_choices, 
		_maxVotes, 
		_finishDate, 
		{
			// from: web3.eth.accounts[0], 
      from: Session.get("currentEthAccount").address,
			data: "0x606060405260405161065738038061065783398101604052805160805160a05160c05160e051938501949283019391909201919060008054600160a060020a0319163317905560018054600160a060020a03191633178155600280548751600083905291926020601f91831615610100026000190190921684900481018290047f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90810193929091908a01908390106100db57805160ff19168380011785555b5061010b9291505b8082111561018357600081556001016100c7565b828001600101855582156100bf579182015b828111156100bf5782518260005055916020019190600101906100ed565b50506003805485516000839052602060026001841615610100026000190190931692909204601f9081018390047fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b9081019390919089019083901061018757805160ff19168380011785555b506101b79291506100c7565b5090565b82800160010185558215610177579182015b82811115610177578251826000505591602001919060010190610199565b505060048054845160008390527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b602060026001851615610100026000190190941693909304601f90810184900482019388019083901061022b57805160ff19168380011785555b5061025b9291506100c7565b8280016001018555821561021f579182015b8281111561021f57825182600050559160200191906001019061023d565b50506005829055600060065560078190556008805460ff1916600117905550505050506103cb8061028c6000396000f3606060405260e060020a600035046341c0e1b5811461003c5780639ae8886a14610065578063a60c812a14610091578063fc36e15b146100b4575b005b61003a600054600160a060020a039081163390911614156102f457600054600160a060020a0316ff5b60015460055460065460075460085461013294600160a060020a03169360029360039360049360ff1688565b6102e25b600154600090600160a060020a0390811633909116146103ba576103c8565b6102e26004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050505050505060015460009033600160a060020a039081169116141580610125575060085460ff16600114155b15610301575060006102fc565b60408051600160a060020a038a1681526080810186905260a0810185905260c0810184905260e08101839052610100602082018181528a546002600182161584026000190190911604918301829052919283019060608401906101208501908c9080156101e05780601f106101b5576101008083540402835291602001916101e0565b820191906000526020600020905b8154815290600101906020018083116101c357829003601f168201915b505084810383528a5460026001821615610100026000190190911604808252602091909101908b9080156102555780601f1061022a57610100808354040283529160200191610255565b820191906000526020600020905b81548152906001019060200180831161023857829003601f168201915b50508481038252895460026001821615610100026000190190911604808252602091909101908a9080156102ca5780601f1061029f576101008083540402835291602001916102ca565b820191906000526020600020905b8154815290600101906020018083116102ad57829003601f168201915b50509b50505050505050505050505060405180910390f35b60408051918252519081900360200190f35b565b505b5060015b919050565b60068054600101905560408051602080825284518282015284517f323082d76bf7cc451f1200da2c10399cea01d7d9bc1e28142959fe8081a722fb93869392839291830191858201918190849082908590600090600490601f850104600f02600301f150905090810190601f16801561038e5780820380516001836020036101000a031916815260200191505b509250505060405180910390a160055460009011156102f857600554600654106102f8576102f6610095565b506008805460ff1916905560015b9056",
			gas: 800000
		}, 
		function(e, contract){ 
			if(!e) { 
				if(!contract.address) { 
					console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined..."); 
				} else { 
					console.log("Contract mined! Address: " + contract.address); console.log(contract);

					// Contract now exists on the block chain, update collection
					Polls.update(pollID, {
				      $set: { 
				      	contract: contract,
                account: Session.get("currentEthAccount"),
				      },
				    });
          Notifications.success('Success', 'Your poll is now live on the blockchain.');
				} 
			} 
		});
 
    // Clear form
    target.title.value = '';
    target.polltype.value = '';
    target.polltype.style.color = "#999";
    for (var i=0; i < choiceFields.length; i++) {
    	choiceFields[i].value = '';
    }
    target.maxVotes.value = '';

    // Reset number of choice fields to 2
    while (numChoiceFields > 2) {
      $('.poll-choices').children()[numChoiceFields-1].remove();
      numChoiceFields -= 1;
    }
    Session.set("choiceFields", numChoiceFields);

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

Template.vote.onCreated(function voteOnCreated() {
  // init reactive variables
  this.choices = new ReactiveVar([]);
  this.address = new ReactiveVar("");

});

Template.vote.helpers({
  choices() {
  	return Session.get("currentChoices");
  },
  pollTypeIsFPTP() {
    return Session.get("currentPoll").pollType == "FPTP";
  },
  pollTypeIsAPRV() {
    return Session.get("currentPoll").pollType == "APRV";
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

    // Store choices selected by user
    var choices = [];
    // Check poll type
    if (currentPoll.pollType == "FPTP") {
      choices.push(target.choice.value);
    } else if (currentPoll.pollType == "APRV") {
      for (var i=0; i < target.choice.length; i++) {
        if (target.choice[i].checked) {
          choices.push(target.choice[i].value);
          target.choice[i].checked = false;
        }
      }
    }
    // Submit vote for each choice selected by user
    choices.forEach( function (choice) {
      // Submit vote to poll in block chain
      poll.vote(choice, 
        {
          // from: web3.eth.accounts[0], 
          from: Session.get("currentEthAccount").address, 
          gas: 200000
        }, 
        function (error,success) {
          if(success) {
            console.log("Vote submitted successfully.")
            Notifications.success('Success', 'Your vote has been placed successfully.');
          } 
        }
      );
    });

   	getVoteEvents();
    $(".vote-section").hide();
    $(".view-votes-section").show();
  },
});

Template.viewvotes.onCreated(function viewvotesOnCreated() {
  // init reactive variables
  this.address = new ReactiveVar("");
  this.allVoteEvents = new ReactiveVar([]);
  this.allVotes = new ReactiveVar([]);

});

Template.viewvotes.helpers({
  votes() {
	  	// Get choices from poll
	 	var pollChoices = Session.get("currentChoices")
	 	if (pollChoices) {         
		 	// Count votes
		  	var votes = [];
		  	
		  	var voteEvents = Session.get("voteEvents");

		  	// Loop through choices for poll
		 	pollChoices.forEach( function (pollChoice) {
		 		// Loop through vote events received
		 		var numVotes = 0;
		 		voteEvents.forEach( function (voteEvent) {
		 			if (pollChoice == voteEvent.args.choice) {
		 				numVotes += 1;
		 			}
		 		});
		 		votes.push({choice: pollChoice, numVotes: numVotes})
		 	});
		 }
  	return votes;
  },
});

Template.poll.helpers({
  'canDeletePoll': function(account) {
    if (account) {
      return Session.get("currentEthAccount").address == account.address
    }
  },
});

Template.poll.events({
	// Delete poll
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
    $(".vote-section").show();
    $(".view-votes-section").hide();
    Session.set("voteEvents", []);
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
    Session.set("voteEvents", []);
    $(".vote-section").hide();
    $(".view-votes-section").show();
    getVoteEvents();
    // Scroll to view votes section
    var viewVotesSection = $(".view-votes-section");
    $('html,body').animate({scrollTop: viewVotesSection.offset().top},'slow');
  },
});
