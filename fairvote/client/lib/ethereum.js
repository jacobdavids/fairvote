import { Polls } from '../../imports/api/polls.js';

observePolls = function(){
  // Observe polls
  Polls.find({}).observe({
    added: function(newDocument) {
      // Check if contract already exists for poll
      if (!newDocument.contract) {
        console.log("Initialising contract...");
        var pollContract = web3.eth.contract([{ constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "pollType", type: "string" }, { name: "choices", type: "string" }, { name: "maxVotes", type: "uint256" }, { name: "numVotes", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "choice", type: "string" }, { name: "preference", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_pollType", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxVotes", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "choice", type: "string" }, { indexed: false, name: "preference", type: "string" }, { indexed: false, name: "sender", type: "address" }], name: "Vote", type: "event" }]);
        var poll = pollContract.new(
          newDocument.title,
          newDocument.pollType,
          newDocument.choices, 
          newDocument.maxVotes, 
          newDocument.finishDate, 
          {
            from: Session.get("currentEthAccount").address,
            data: "0x606060405260405161069438038061069483398101604052805160805160a05160c05160e051938501949283019391909201919060008054600160a060020a0319163317905560018054600160a060020a03191633178155600280548751600083905291926020601f91831615610100026000190190921684900481018290047f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90810193929091908a01908390106100db57805160ff19168380011785555b5061010b9291505b8082111561018357600081556001016100c7565b828001600101855582156100bf579182015b828111156100bf5782518260005055916020019190600101906100ed565b50506003805485516000839052602060026001841615610100026000190190931692909204601f9081018390047fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b9081019390919089019083901061018757805160ff19168380011785555b506101b79291506100c7565b5090565b82800160010185558215610177579182015b82811115610177578251826000505591602001919060010190610199565b505060048054845160008390527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b602060026001851615610100026000190190941693909304601f90810184900482019388019083901061022b57805160ff19168380011785555b5061025b9291506100c7565b8280016001018555821561021f579182015b8281111561021f57825182600050559160200191906001019061023d565b50506005829055600060065560078190556008805460ff1916600117905550505050506104088061028c6000396000f3606060405260e060020a600035046341c0e1b581146100315780639ae8886a1461005b578063e8d5940d14610087575b005b61002f600054600160a060020a03908116339190911614156102c257600054600160a060020a0316ff5b60015460055460065460075460085461011a94600160a060020a03169360029360039360049360ff1688565b60206004803580820135601f8101849004909302608090810160405260608481526102b094602493919291840191819083828082843750506040805160208835808b0135601f810183900483028401830190945283835297999860449892975091909101945090925082915084018382808284375094965050505050505060085460009060ff166001146102c457610402565b606088815260e08590526101008481526101208490526101408390526080818152895460018116159092026000190190911689900461016081905260a09060c090610180908c9080156101ae5780601f10610183576101008083540402835291602001916101ae565b820191906000526020600020905b81548152906001019060200180831161019157829003601f168201915b5050605f19810183528a5460018116156101000260001901168c9004808252602091909101908b9080156102235780601f106101f857610100808354040283529160200191610223565b820191906000526020600020905b81548152906001019060200180831161020657829003601f168201915b5050605f1981018252895460018116156101000260001901168c9004808252602091909101908a9080156102985780601f1061026d57610100808354040283529160200191610298565b820191906000526020600020905b81548152906001019060200180831161027b57829003601f168201915b50509b50505050505050505050505060405180910390f35b60408051918252519081900360200190f35b565b600160016000506005016000828282505401925050819055507f103623769222181e1bab5f8304e6273bbc93de64bf7a4a3690638f2b63c32e4383833360405180806020018060200184600160a060020a031681526020018381038352868181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156103745780820380516001836020036101000a031916815260200191505b508381038252858181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156103cd5780820380516001836020036101000a031916815260200191505b509550505050505060405180910390a1600554819011156103fe57600554600654106103fe576008805460ff191690555b5060015b9291505056",
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
}

submitVotes = function(poll, votes){
  // Submit vote for each choice selected by user
  votes.forEach( function (vote) {
    // Submit vote to poll in block chain
    poll.vote(
      vote.choice,
      vote.preference, 
      {
        from: Session.get("currentEthAccount").address, 
      }, 
      function (error,success) {
        if(success) {
          console.log("Vote submitted successfully.")
        } 
      }
    );
  });
}

getVoteEvents = function(){
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
        var currentPoll = Session.get("currentPoll");
        var voterAddresses = currentPoll.voters;
        var pollType = currentPoll.pollType;
        
        // Ensure senders address does not exist inside list of voters
        if ($.inArray(result.args.sender, voterAddresses) < 0) {
          if (pollType == "FPTP") {
            // Add vote to list of votes and senders address to list of voters for poll
            Polls.update(currentPoll._id, {
              $push: {
                votes: result.args,
                voters: result.args.sender,
              },
            });
            Notifications.success('Success', 'Your vote is now live on the blockchain.');
          } else if ((pollType == "APRV") || (pollType == "AV")) {
            // Add vote to list of votes for poll
            Polls.update(currentPoll._id, {
              $push: {
                votes: result.args,
              },
            });
            // Update current poll
            var currentPoll = Session.get("currentPoll");

            var votes = currentPoll.votes;
            var maxVotes = currentPoll.maxVotes;
            var maxVoters = currentPoll.maxVoters;

            // Count number of votes received from senders address
            var votesReceived = 0;
            votes.forEach( function (vote) {
              if (vote.sender == result.args.sender) {
                votesReceived += 1;
              }
            });

            // Check if this vote is last one permitted from senders address
            if (votesReceived == (maxVotes/maxVoters)) {
              // Add senders address to list of voters for poll
              Polls.update(currentPoll._id, {
                $push: {
                  voters: result.args.sender,
                },
              });
              Notifications.success('Success', 'Your vote is now live on the blockchain.');
            }
          }
        }
			} 
	});
}