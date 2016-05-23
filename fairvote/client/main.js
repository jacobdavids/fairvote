import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'
import { Polls } from '../imports/api/polls.js';

import './templates/main.html';

Meteor.startup(function () {
    _.extend(Notifications.defaultOptions, {
        timeout: 5000
    });
});

function countVotes(choices, votes) {
  var countedVotes = [];
  // Check if choices exist
  if (choices) {    
    // Loop through choices for poll
    choices.forEach( function (choice) {
      // Count votes for each choice
      var numVotes = 0;
      votes.forEach( function (vote) {
         if (choice == vote.choice) {
           numVotes += 1;
         }
       });
      // Add count of votes for each choice to array
      countedVotes.push({choice: choice, numVotes: numVotes});
    });
  return countedVotes;
  }
}

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
        var voterAddresses = Session.get("currentPoll").voters;
        if ($.inArray(result.args.sender, voterAddresses) < 0) {
          // Sender has not voted yet
          Polls.update(Session.get("currentPoll")._id, {
          $push: {
            votes: result.args,
            voters: result.args.sender,
          },
        });
        console.log(result.args.choice);
        }
			} 
	});
}

function observePolls(){
  // Observe polls
  Polls.find({}).observe({
    added: function(newDocument) {
      // Check if contract already exists for poll
      if (!newDocument.contract) {
        console.log("Initialising contract...");
        // var pollContract = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "pollType", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "deactivatePoll", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_pollType", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }, { indexed: false, name: "sender", type: "address" }], name: "Vote", type: "event" }]);
        var pollContract = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "pollType", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_pollType", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }, { indexed: false, name: "sender", type: "address" }], name: "Vote", type: "event" }]);
        var poll = pollContract.new(
          newDocument.title,
          newDocument.pollType,
          newDocument.choices, 
          newDocument.maxVotes, 
          newDocument.finishDate, 
          {
            from: Session.get("currentEthAccount").address,
            data: "0x60606040526040516105f53803806105f583398101604052805160805160a05160c05160e051938501949283019391909201919060008054600160a060020a0319163317905560018054600160a060020a03191633178155600280548751600083905291926020601f91831615610100026000190190921684900481018290047f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90810193929091908a01908390106100db57805160ff19168380011785555b5061010b9291505b8082111561018357600081556001016100c7565b828001600101855582156100bf579182015b828111156100bf5782518260005055916020019190600101906100ed565b50506003805485516000839052602060026001841615610100026000190190931692909204601f9081018390047fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b9081019390919089019083901061018757805160ff19168380011785555b506101b79291506100c7565b5090565b82800160010185558215610177579182015b82811115610177578251826000505591602001919060010190610199565b505060048054845160008390527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b602060026001851615610100026000190190941693909304601f90810184900482019388019083901061022b57805160ff19168380011785555b5061025b9291506100c7565b8280016001018555821561021f579182015b8281111561021f57825182600050559160200191906001019061023d565b50506005829055600060065560078190556008805460ff1916600117905550505050506103698061028c6000396000f3606060405260e060020a600035046341c0e1b581146100315780639ae8886a1461005b578063fc36e15b14610087575b005b61002f600054600160a060020a039081163391909116141561028457600054600160a060020a0316ff5b6001546005546006546007546008546100dc94600160a060020a03169360029360039360049360ff1688565b60206004803580820135601f8101849004909302608090810160405260608481526102729460249391929184019181908382808284375094965050505050505060085460009060ff1660011461028657610364565b606088815260e08590526101008481526101208490526101408390526080818152895460018116159092026000190190911689900461016081905260a09060c090610180908c9080156101705780601f1061014557610100808354040283529160200191610170565b820191906000526020600020905b81548152906001019060200180831161015357829003601f168201915b5050605f19810183528a5460018116156101000260001901168c9004808252602091909101908b9080156101e55780601f106101ba576101008083540402835291602001916101e5565b820191906000526020600020905b8154815290600101906020018083116101c857829003601f168201915b5050605f1981018252895460018116156101000260001901168c9004808252602091909101908a90801561025a5780601f1061022f5761010080835404028352916020019161025a565b820191906000526020600020905b81548152906001019060200180831161023d57829003601f168201915b50509b50505050505050505050505060405180910390f35b60408051918252519081900360200190f35b565b600160016000506005016000828282505401925050819055507f6df8a0bf3c87bd629e9f543b9d0831beeea8b80de3f478dd846541ed8d97405b8233604051808060200183600160a060020a031681526020018281038252848181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156103315780820380516001836020036101000a031916815260200191505b50935050505060405180910390a1600554819011156103605760055460065410610360576008805460ff191690555b5060015b91905056",
            // data: "0x606060405260405161065038038061065083398101604052805160805160a05160c05160e051938501949283019391909201919060008054600160a060020a0319163317905560018054600160a060020a03191633178155600280548751600083905291926020601f91831615610100026000190190921684900481018290047f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90810193929091908a01908390106100db57805160ff19168380011785555b5061010b9291505b8082111561018357600081556001016100c7565b828001600101855582156100bf579182015b828111156100bf5782518260005055916020019190600101906100ed565b50506003805485516000839052602060026001841615610100026000190190931692909204601f9081018390047fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b9081019390919089019083901061018757805160ff19168380011785555b506101b79291506100c7565b5090565b82800160010185558215610177579182015b82811115610177578251826000505591602001919060010190610199565b505060048054845160008390527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b602060026001851615610100026000190190941693909304601f90810184900482019388019083901061022b57805160ff19168380011785555b5061025b9291506100c7565b8280016001018555821561021f579182015b8281111561021f57825182600050559160200191906001019061023d565b50506005829055600060065560078190556008805460ff1916600117905550505050506103c48061028c6000396000f3606060405260e060020a600035046341c0e1b5811461003c5780639ae8886a14610066578063a60c812a14610092578063fc36e15b146100b5575b005b61003a600054600160a060020a03908116339190911614156102d657600054600160a060020a0316ff5b60015460055460065460075460085461011494600160a060020a03169360029360039360049360ff1688565b6102c45b600154600090600160a060020a0390811633909116146103b3576103c1565b6102c46004808035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050505050505060085460009060ff166001146102e3576102de565b60408051600160a060020a038a1681526080810186905260a0810185905260c0810184905260e08101839052610100602082018181528a546002600182161584026000190190911604918301829052919283019060608401906101208501908c9080156101c25780601f10610197576101008083540402835291602001916101c2565b820191906000526020600020905b8154815290600101906020018083116101a557829003601f168201915b505084810383528a5460026001821615610100026000190190911604808252602091909101908b9080156102375780601f1061020c57610100808354040283529160200191610237565b820191906000526020600020905b81548152906001019060200180831161021a57829003601f168201915b50508481038252895460026001821615610100026000190190911604808252602091909101908a9080156102ac5780601f10610281576101008083540402835291602001916102ac565b820191906000526020600020905b81548152906001019060200180831161028f57829003601f168201915b50509b50505050505050505050505060405180910390f35b60408051918252519081900360200190f35b565b505b5060015b919050565b6006805460010190556040805133600160a060020a03811660208381019190915283835285519383019390935284517f6df8a0bf3c87bd629e9f543b9d0831beeea8b80de3f478dd846541ed8d97405b9386939182916060830191868201918190849082908590600090600490601f850104600f02600301f150905090810190601f1680156103865780820380516001836020036101000a031916815260200191505b50935050505060405180910390a160055460009011156102da57600554600654106102da576102d8610096565b506008805460ff1916905560015b9056",
            gas: 800000
          }, 
          function(e, contract){ 
            if(!e) { 
              if(!contract.address) { 
                console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined..."); 
              } else { 
                console.log("Contract mined! Address: " + contract.address); console.log(contract);

                // Contract now exists on the block chain, update collection
                Polls.update(newDocument._id, {
                    $set: { 
                      contract: contract,
                      account: Session.get("currentEthAccount"),
                    },
                  });
                Notifications.success('Success', 'Your poll is now live on the blockchain.');
              } 
            } 
          });
      }
    },
    changed: function(newDocument, oldDocument){
      if (newDocument.votes.length > 0) {
        var choices = JSON.parse(newDocument.choices);
        var countedVotes = countVotes(choices, newDocument.votes);
        Session.set("countedVotes", countedVotes);
        Session.set("currentPoll", newDocument);
      }
    },
    removed: function(newDocument){

    },

  });
};

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
 
    // Get input poll data
    const target = event.target;
    const title = target.title.value;
    const pollType = target.polltype.value;
    const maxVotes = target.maxVotes.value;
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
      maxVotes: maxVotes,
      finishDate: finishDate,
      voters: [],
      votes: [],
      createdAt: new Date(), // current time
    });
 
    // Clear form
    target.title.value = '';
    target.polltype.value = '';
    target.polltype.style.color = "#999";
    for (var i=0; i < choiceFields.length; i++) {
    	choiceFields[i].value = '';
    }
    target.maxVotes.value = '';
    target.finishDate.value = '';

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

Template.createpoll.onRendered(function () {
  // Initiate datetime picker
  $('.datetimepicker').datetimepicker({
    allowInputToggle: true,
  });
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

    // Get vote events from blockchain for this poll
   	getVoteEvents();

    // Count votes
    var choices = Session.get("currentChoices");
    var votes = Session.get("currentPoll").votes;
    var countedVotes = countVotes(choices, votes);
    // Store counted votes in session data
    Session.set("countedVotes", countedVotes);

    // Set session data
    Session.set("currentChoices", JSON.parse(currentPoll.choices));
    $(".vote-section").hide();
    $(".view-votes-section").show();
  },
});

Template.viewvotes.helpers({
  votes() {
    // Get counted votes array from session data
    return Session.get("countedVotes");
  },
  poll() {
    return Session.get("currentPoll");
  },
  pollIsActive() {
    var currentPoll = Session.get("currentPoll");
    if (this.contract) {
      // Get poll
      var poll = web3.eth.contract(this.contract.abi).at(this.contract.address);

      // Get if poll is active
      var pollIsActive = poll.p()[7];

      return pollIsActive;
    }
  },
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
  numVotesReceived() {
    return this.votes.length;
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
