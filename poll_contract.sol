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
    uint maxVotes;
    uint numVotes;
    uint finishDate;
    bool active;
  }

  /* Event to call when a vote is placed */
  event Vote(string choice, string preference, address sender);

  /* Define public Poll p */
  Poll public p;

  /* Initiator function to set values of public Poll p */
  function poll(string _title, string _pollType, string _choices, uint _maxVotes, uint _finishDate) {
    p.owner = msg.sender;
    p.title = _title;
    p.pollType = _pollType;
    p.choices = _choices;
    p.maxVotes = _maxVotes;
    p.numVotes = 0;
    p.finishDate = _finishDate;
    p.active = true;
  }

  /* Function to handle the process of voting, when maxVotes reached poll is deactivated */
  function vote(string choice, string preference) returns (bool) {
    if (p.active != true) {
      return false;
    }

    p.numVotes += 1;
    Vote(choice, preference, msg.sender);

    if (p.maxVotes > 0) {
      if (p.numVotes >= p.maxVotes) {
        p.active = false;
      }
    }
    return true;
  }
}
