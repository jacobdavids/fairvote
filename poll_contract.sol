contract mortal {
    /* Define variable owner of the type address */
    address owner;

    /* this function is executed at initialization and sets the owner of the contract */
    function mortal() { 
      owner = msg.sender; 
    }

    /* Function to recover the funds on the contract */
    function kill() { 
      if (msg.sender == owner) 
        suicide(owner); 
    }
}

contract poll is mortal {

  /* Define Poll struct */
  struct Poll {
    address owner;
    string title;
    string pollType;
    string choices;
    uint maxBallots;
    uint numBallots;
    uint finishDate;
    bool active;
  }

  /* Define public Poll p */
  Poll public p;

  /* Initiator function to set values of public Poll p */
  function poll(string _title, string _pollType, string _choices, uint _maxBallots, uint _finishDate) {
    p.owner = msg.sender;
    p.title = _title;
    p.pollType = _pollType;
    p.choices = _choices;
    p.maxBallots = _maxBallots;
    p.numBallots = 0;
    p.finishDate = _finishDate;
    p.active = true;
  }

  /* Event to call when a ballot is placed */
  event Ballot(string votes, address sender);

  /* Declare state variable that records if sender address has submitted ballot. */
  mapping(address => bool) public hasVoted;

  /* Function to handle the process of voting, when maxBallots reached poll is deactivated */
  function vote(string votes) returns (bool) {
    if (p.active != true) {
      return false;
    }

    /* Check if sender address has voted already */
    if (hasVoted[msg.sender]) {
      return false;
    }

    p.numBallots += 1;

    /* Call Ballot event with senders votes and address */
    Ballot(votes, msg.sender);

    /* Record sender address as having voted */
    hasVoted[msg.sender] = true;

    /* Check if number of ballots received has exceeded maximum specified */
    if (p.maxBallots > 0) {
      if (p.numBallots >= p.maxBallots) {
        p.active = false;
      }
    }
    return true;
  }
}