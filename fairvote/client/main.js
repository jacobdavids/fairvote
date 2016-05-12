import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Polls } from '../imports/api/polls.js';

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
  },
});

Template.body.helpers({
  polls() {
    return Polls.find({});
  },
});

Template.createpoll.events({
  'click button'(event, instance) {
    // create a new poll when button is clicked
 //    console.log("Initialising contract...")
 //    var pollSource = 'contract mortal { /* Define variable owner of the type address*/ address owner; /* this function is executed at initialization and sets the owner of the contract */ function mortal() { owner = msg.sender; } /* Function to recover the funds on the contract */ function kill() { if (msg.sender == owner) suicide(owner); } } contract NewPoll is mortal { struct Poll { address owner; string title; uint votelimit; string options; uint deadline; bool status; uint numVotes; } event NewVote(string votechoice); Poll public p; function NewPoll(string _options, string _title, uint _votelimit, uint _deadline) { p.owner = msg.sender; p.options = _options; p.title = _title; p.votelimit = _votelimit; p.deadline = _deadline; p.status = true; p.numVotes = 0; } function vote(string choice) returns (bool) { if (msg.sender != p.owner || p.status != true) { return false; } p.numVotes += 1; NewVote(choice); if (p.votelimit > 0) { if (p.numVotes >= p.votelimit) { endPoll(); } } return true; } function endPoll() returns (bool) { if (msg.sender != p.owner) { return false; } p.status = false; return true; } function getTitle() constant returns (string){ if (msg.sender != p.owner) { return "invalid sender m8"; } return p.title; } }';
 //    var pollCompiled = web3.eth.compile.solidity(pollSource);
 //    var _options = '["Donald Trump", "Hillary Clinton", "Bernie Sanders"]';
	// var _title = 'The 2016 US Election';
	// var _votelimit = 10;
	// var _deadline = '146304148900';
	// var pollContract = web3.eth.contract(pollCompiled.NewPoll.info.abiDefinition);
	// var poll = pollContract.new(_options, _title, _votelimit, _deadline, {from:web3.eth.accounts[0], data: pollCompiled.NewPoll.code, gas: 800000}, function(e, contract){ if(!e) { if(!contract.address) { console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined..."); } else { console.log("Contract mined! Address: " + contract.address); console.log(contract); } } })
  },
});