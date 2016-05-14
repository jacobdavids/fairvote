import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Polls } from '../imports/api/polls.js';
import { Votes } from '../imports/api/votes.js';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
    // Meteor.call('removeAllPolls');
  },
});

Template.body.onCreated(function bodyOnCreated() {
  // init reactive variables
  this.polls = new ReactiveVar([]);
});

Template.body.helpers({
  polls() {
    return Polls.find({});
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
    const choice1 = target.choice1.value;
    const choice2 = target.choice2.value;
    const maxVotes = target.maxVotes.value;
 
 	var choices = [];
 	choices.push(choice1);
 	choices.push(choice2);
 	choices = JSON.stringify(choices);
    // Insert a poll into the collection
    var pollID = Polls.insert({
      title: title,
      choices: choices,
      maxVotes: maxVotes,
      createdAt: new Date(), // current time
    });
	// create a new poll when button is clicked
    console.log("Initialising contract...");
	var _title = title;
	var _choices = choices;
	var _maxVotes = maxVotes;
	var _finishDate = '146304148900';
	var pollContract = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "deactivatePoll", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }], name: "Vote", type: "event" }]);
	var poll = pollContract.new(
		_title,
		_choices, 
		_maxVotes, 
		_finishDate, 
		{
			from: web3.eth.accounts[0], 
			data: "0x606060405260405161053438038061053483398101604052805160805160a05160c05192840193919091019160008054600160a060020a0319163317905560018054600160a060020a03191633178155600280548651600083905291926020601f91831615610100026000190190921684900481018290047f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace908101939290919089019083901061010357805160ff19168380011785555b506101339291505b808211156101ab57600081556001016100bf565b50506004829055600060055560068190556007805460ff1916600117905550505050610355806101df6000396000f35b828001600101855582156100b7579182015b828111156100b7578251826000505591602001919060010190610115565b50506003805484516000839052602060026001841615610100026000190190931692909204601f9081018390047fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b908101939091908801908390106101af57805160ff19168380011785555b506100d39291506100bf565b5090565b8280016001018555821561019f579182015b8281111561019f5782518260005055916020019190600101906101c156606060405260e060020a600035046341c0e1b5811461003c5780639ae8886a14610065578063a60c812a14610093578063fc36e15b146100b6575b005b61003a600054600160a060020a0390811633909116141561027e57600054600160a060020a0316ff5b60015460045460055460065460075461013494600160a060020a031693600293600393919290919060ff1687565b61026c5b600154600090600160a060020a03908116339091161461034457610352565b61026c6004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050505050505060015460009033600160a060020a039081169116141580610127575060075460ff16600114155b1561028b57506000610286565b60408051600160a060020a0389168152606081018690526080810185905260a0810184905260c0810183905260e06020820181815289546002600182161561010090810260001901909216049284018390529293909290840191908401908a9080156101e15780601f106101b6576101008083540402835291602001916101e1565b820191906000526020600020905b8154815290600101906020018083116101c457829003601f168201915b5050838103825288546002600182161561010002600019019091160480825260209190910190899080156102565780601f1061022b57610100808354040283529160200191610256565b820191906000526020600020905b81548152906001019060200180831161023957829003601f168201915b5050995050505050505050505060405180910390f35b60408051918252519081900360200190f35b565b505b5060015b919050565b60058054600101905560408051602080825284518282015284517f323082d76bf7cc451f1200da2c10399cea01d7d9bc1e28142959fe8081a722fb93869392839291830191858201918190849082908590600090600490601f850104600f02600301f150905090810190601f1680156103185780820380516001836020036101000a031916815260200191505b509250505060405180910390a16004546000901115610282576004546005541061028257610280610097565b506007805460ff1916905560015b9056",
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
				      },
				    });
				} 
			} 
		});
 
    // Clear form
    target.title.value = '';
    target.choice1.value = '';
    target.choice2.value = '';
    target.maxVotes.value = '';
  },
});

Template.vote.onCreated(function voteOnCreated() {
  // init reactive variables
  this.choices = new ReactiveVar([]);
  this.address = new ReactiveVar("");

});

Template.vote.helpers({
  polls() {
    return Polls.find({});
  },
  choices() {
  	return Template.instance().choices.get()
  },
});

Template.vote.events({
	// Show choices for selected poll
  'submit .select-poll': function(event, template) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get selected poll address
    const target = event.target;
    const address = target.select.value;
 	// Get poll from block chain
 	var poll = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "deactivatePoll", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }], name: "Vote", type: "event" }]).at(address);
 
 	// Get choices from poll
 	var vote_choices = JSON.parse(poll.p()[2]);
 	template.choices.set(vote_choices);
 	template.address.set(address);
  },
  // Submit vote on poll
  'submit .vote-on-poll': function(event, template) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get selected choice
    const target = event.target;
    const choice = target.choice.value;

    // Get selected address
    const address = template.address.get();

    // Get poll from address
	var poll = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "deactivatePoll", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }], name: "Vote", type: "event" }]).at(address);
 	// Submit vote to poll in block chain
 	poll.vote(choice, 
 		{
 			from: web3.eth.accounts[0], 
 			gas: 200000
 		}, 
 		function (error,success) {
 			if(success) {
 				console.log("Vote submitted successfully.")
 			} 
 		}
 	);
  },
});

Template.viewvotes.onCreated(function viewvotesOnCreated() {
  // init reactive variables
  this.address = new ReactiveVar("");
  this.allVoteEvents = new ReactiveVar([]);
  this.allVotes = new ReactiveVar([]);

});

Template.viewvotes.helpers({
  polls() {
    return Polls.find({});
  },
  votes() {
  	// Get selected poll
  	var selectedPoll;
  	var allPolls = Polls.find({}).fetch();
  	allPolls.forEach( function (poll) {
  		if (poll.contract) {
  			if (poll.contract.address == Template.instance().address.get()) {
  				selectedPoll = poll;
  			}
  		}
  	});

  	if (selectedPoll) {
	  	// Get choices from poll
	 	var pollChoices = JSON.parse(selectedPoll.choices);
	 	// Count votes
	  	var votes = [];
	  	// var votes = Template.instance().votes.get()
	  	// Loop through choices for poll
	 	pollChoices.forEach( function (pollChoice) {
	 		// Loop through vote events received
	 		var numVotes = 0;
	 		Template.instance().allVoteEvents.get().forEach( function (voteEvent) {
	 			if (pollChoice == voteEvent.args.choice) {
	 				numVotes += 1;
	 			}
	 		});
	 		votes.push({choice: pollChoice, numVotes: numVotes})
	 	});
	 	Template.instance().allVotes.set(votes);
  	}


  	return Template.instance().allVotes.get();
  },
});

Template.viewvotes.events({
	// Show choices for selected poll
  'submit .select-poll': function(event, template) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get selected poll address
    const target = event.target;
    const address = target.select.value;

    // Set reactive variable
 	template.address.set(address);

 	// Get selected poll
  	var selectedPoll;
  	var allPolls = Polls.find({}).fetch();
  	allPolls.forEach( function (poll) {
  		if (poll.contract) {
  			if (poll.contract.address == Template.instance().address.get()) {
  				selectedPoll = poll;
  			}
  		}
  	});

  	// Get poll from block chain using address
  	if (selectedPoll) {
  		var poll = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "deactivatePoll", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }], name: "Vote", type: "event" }]).at(selectedPoll.contract.address);
	  	// Get votes using filter commands - add an array to grab the result for each filter (e.g. current_votes.push(result))
		var voteEvents = [];
		var start_block = web3.eth.getTransaction(selectedPoll.contract.transactionHash).blockNumber
		var filter = poll.Vote(
			{}, 
			{
				fromBlock: start_block, 
				toBlock: 'latest'
			},
			function(err, result) {
				if (!err) {
					// voteEvents.push(result);
					var allVoteEvents = template.allVoteEvents.get()
					allVoteEvents.push(result);
					template.allVoteEvents.set(voteEvents);
					console.log(result);
				} 
		});
  	}
  },
});

Template.poll.events({
	// Delete poll
  'click .delete-poll'() {
    // Get poll from blockchain
  	var poll = web3.eth.contract(this.contract.abi).at(this.contract.address);
  	// Kill poll from blockchain
  	poll.kill.sendTransaction({from:web3.eth.accounts[0]});
	// Remove poll from database
  	Polls.remove(this._id);
  	console.log("Poll deleted from blockchain");
  },
});