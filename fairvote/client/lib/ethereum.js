import { Polls } from '../../imports/api/polls.js';

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

observePolls = function(){
  // Observe polls
  Polls.find({}).observe({
    added: function(newDocument) {
      // Check if contract already exists for poll
      if (!newDocument.contract) {
        console.log("Initialising contract...");
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

submitVotes = function(poll, choices){
  // Submit vote for each choice selected by user
  choices.forEach( function (choice) {
    // Submit vote to poll in block chain
    poll.vote(choice, 
      {
        from: Session.get("currentEthAccount").address, 
      }, 
      function (error,success) {
        if(success) {
          console.log("Vote submitted successfully.")
          Notifications.success('Success', 'Your vote has been placed successfully.');
        } 
      }
    );
  });
}