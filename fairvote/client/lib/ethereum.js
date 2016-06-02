import { Polls } from '../../imports/api/polls.js';

observePolls = function(){
  // Observe polls collection
  Polls.find({}).observe({
    // Called when new polls are created in collection
    added: function(newDocument) {
      // Check if contract already exists for poll and owner matches current ethereum account
      if (!newDocument.contract && newDocument.owner.address == Session.get("currentEthAccount").address) {
        
        console.log("Initialising contract...");

        // Get poll contract
        var pollContract = web3.eth.contract([{ constant: true, inputs: [{ name: "", type: "address" }], name: "hasVoted", outputs: [{ name: "", type: "bool" }], type: "function" }, { constant: false, inputs: [], name: "kill", outputs: [], type: "function" }, { constant: true, inputs: [], name: "p", outputs: [{ name: "owner", type: "address" }, { name: "title", type: "string" }, { name: "pollType", type: "string" }, { name: "choices", type: "string" }, { name: "maxBallots", type: "uint256" }, { name: "numBallots", type: "uint256" }, { name: "finishDate", type: "uint256" }, { name: "active", type: "bool" }], type: "function" }, { constant: false, inputs: [{ name: "votes", type: "string" }], name: "vote", outputs: [{ name: "", type: "bool" }], type: "function" }, { inputs: [{ name: "_title", type: "string" }, { name: "_pollType", type: "string" }, { name: "_choices", type: "string" }, { name: "_maxBallots", type: "uint256" }, { name: "_finishDate", type: "uint256" }], type: "constructor" }, { anonymous: false, inputs: [{ indexed: false, name: "votes", type: "string" }, { indexed: false, name: "sender", type: "address" }], name: "Ballot", type: "event" }]);
        
        // Convert choices array to string for storage in contract
        var choices = JSON.stringify(newDocument.choices);

        // Create new poll on block chain
        var poll = pollContract.new(
          newDocument.title,
          newDocument.pollType,
          choices, 
          newDocument.maxVoters, 
          newDocument.finishDate, 
          {
            from: Session.get("currentEthAccount").address,
            data: "0x606060405260405161067d38038061067d83398101604052805160805160a05160c05160e051938501949283019391909201919060008054600160a060020a0319163317905560018054600160a060020a03191633178155600280548751600083905291926020601f91831615610100026000190190921684900481018290047f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90810193929091908a01908390106100db57805160ff19168380011785555b5061010b9291505b8082111561018357600081556001016100c7565b828001600101855582156100bf579182015b828111156100bf5782518260005055916020019190600101906100ed565b50506003805485516000839052602060026001841615610100026000190190931692909204601f9081018390047fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b9081019390919089019083901061018757805160ff19168380011785555b506101b79291506100c7565b5090565b82800160010185558215610177579182015b82811115610177578251826000505591602001919060010190610199565b505060048054845160008390527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b602060026001851615610100026000190190941693909304601f90810184900482019388019083901061022b57805160ff19168380011785555b5061025b9291506100c7565b8280016001018555821561021f579182015b8281111561021f57825182600050559160200191906001019061023d565b50506005829055600060065560078190556008805460ff1916600117905550505050506103f18061028c6000396000f3606060405260e060020a600035046309eef43e811461003c57806341c0e1b5146100575780639ae8886a14610081578063fc36e15b146100ad575b005b61010260043560096020526000908152604090205460ff1681565b61003a600054600160a060020a03908116339190911614156102aa57600054600160a060020a0316ff5b60015460055460065460075460085461011494600160a060020a03169360029360039360049360ff1688565b60206004803580820135601f8101849004909302608090810160405260608481526101029460249391929184019181908382808284375094965050505050505060085460009060ff166001146103ce576103c9565b60408051918252519081900360200190f35b606088815260e08590526101008481526101208490526101408390526080818152895460018116159092026000190190911689900461016081905260a09060c090610180908c9080156101a85780601f1061017d576101008083540402835291602001916101a8565b820191906000526020600020905b81548152906001019060200180831161018b57829003601f168201915b5050605f19810183528a5460018116156101000260001901168c9004808252602091909101908b90801561021d5780601f106101f25761010080835404028352916020019161021d565b820191906000526020600020905b81548152906001019060200180831161020057829003601f168201915b5050605f1981018252895460018116156101000260001901168c9004808252602091909101908a9080156102925780601f1061026757610100808354040283529160200191610292565b820191906000526020600020905b81548152906001019060200180831161027557829003601f168201915b50509b50505050505050505050505060405180910390f35b565b600160016000506005016000828282505401925050819055507fe4f1f218787aa245d92c1aa41a45bf96ba573d635f5927811c6aef96ae2ffc9b8233604051808060200183600160a060020a031681526020018281038252848181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156103575780820380516001836020036101000a031916815260200191505b50935050505060405180910390a160016009600050600033600160a060020a0316815260200190815260200160002060006101000a81548160ff02191690830217905550600060016000506004016000505411156103c557600554600654106103c5576008805460ff191690555b5060015b919050565b600160a060020a03331681526009602052604081205460ff16156102ac576103c956",
            gas: 800000
          }, 
          function(e, contract){ 
            if(!e) { 
              if(!contract.address) { 
                console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined..."); 
              } else { 
                console.log("Contract mined! Address: " + contract.address); console.log(contract);

                // Get current block and store in poll collection
                currentBlock = web3.eth.getTransaction(contract.transactionHash).blockNumber;

                // Contract now exists on the block chain, update collection with contract and current block
                Polls.update(newDocument._id, {
                    $set: { 
                      contract: contract,
                      block: currentBlock,
                    },
                  });

                // Inform user their poll is now live
                Notifications.success('Success', 'Your poll is now live on the blockchain.');
              } 
            } 
          });
      }
    },
    // Called when a poll is changed in collection
    changed: function(newDocument, oldDocument){
      // Check that a ballot has been received
      if (newDocument.rawBallots.length > oldDocument.rawBallots.length) {

        // Recount votes for poll
        var countedVotes = countVotes(newDocument.choices, newDocument.rawBallots);
        
        // Update the counted votes session variable
        Session.set("countedVotes", countedVotes);

        // Update current poll session variable
        Session.set("currentPoll", newDocument);
      }
    },

  });
}

submitVotes = function(poll, votes){
  // Convert votes to string to store on blockchain
  var votesString = JSON.stringify(votes);

  // Submit vote to poll on block chain
  poll.vote(
    votesString, 
    {
      from: Session.get("currentEthAccount").address,
      gas: 200000,
    }, 
    function (error,success) {
      if(success) {
        console.log("Vote submitted successfully.")
      } 
    }
  );
}

getVoteEvents = function(){
	// Get current poll
  var currentPoll = Session.get("currentPoll");

  // Get selected address
  var address = currentPoll.contract.address;

  // Get poll from address
	var poll = web3.eth.contract(currentPoll.contract.abi).at(address);

	// Count votes for the poll now
 	var startBlock = currentPoll.block;

  // Get all ballot events from block chain
  var filter = poll.Ballot(
		{}, 
		{
			fromBlock: startBlock, 
			toBlock: 'latest'
		},
		function(err, result) {
			if (!err) {
        // Ballot event found, get the current poll
        var currentPoll = Session.get("currentPoll");

        // Ensure senders address does not exist inside list of current voters for current poll
        if ($.inArray(result.args.sender, currentPoll.voters) < 0) {

          // Check for duplicate choices & preferences to protect against manually entered ballots from attackers
          var ballot = JSON.parse(result.args.votes);

          // Create arrays of all choices and preferences on ballot
          var choices = [];
          var preferences = [];
          ballot.forEach( function (vote) {
            if (vote.preference !== "") {
              choices.push(vote.choice);
            }
            if (vote.preference !== "") {
              choices.push(vote.preference);
            }
          });

          // If either array contains duplicates, we will not count this ballot (spoiled ballot)
          if (((new Set(choices)).size !== choices.length) || 
              ((new Set(preferences)).size !== preferences.length)) {
            return;
          }

          // Push ballot to list of ballots and add senders address to list of voters
          Polls.update(currentPoll._id, {
            $push: {
              rawBallots: result.args,
              voters: result.args.sender,
            },
          });

          // Notify user their vote is now live on the blockchain
          Notifications.success('Success', 'Your vote is now live on the blockchain.');
        }
			} 
	});
}