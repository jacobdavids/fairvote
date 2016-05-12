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

Template.body.events({
  'submit .new-poll'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const title = target.title.value;
    const choice1 = target.choice1.value;
    const choice2 = target.choice2.value;
    const maxvotes = target.maxvotes.value;
 
    // Insert a task into the collection
    Polls.insert({
      title,
      choice1,
      choice2,
      maxvotes,
      createdAt: new Date(), // current time
    });
 
    // Clear form
    target.title.value = '';
    target.choice1.value = '';
    target.choice2.value = '';
    target.maxvotes.value = '';
  },
});

Template.poll.events({
  'click .delete-poll'() {
    Polls.remove(this._id);
  },
});

// Template.createpoll.events({
//   'click button'(event, instance) {
//     // create a new poll when button is clicked
//     console.log("Initialising contract...");
//     var pollSource = '';
//  	console.log(pollSource);
//     var pollCompiled = web3.eth.compile.solidity(pollSource);
//     var _options = '["Donald Trump", "Hillary Clinton", "Bernie Sanders"]';
// 	var _title = 'The 2018 US Election';
// 	var _votelimit = 10;
// 	var _deadline = '146304148900';
// 	var pollContract = web3.eth.contract(pollCompiled.NewPoll.info.abiDefinition);
// 	var poll = pollContract.new(_options, _title, _votelimit, _deadline, {from:web3.eth.accounts[0], data: pollCompiled.NewPoll.code, gas: 800000}, function(e, contract){ if(!e) { if(!contract.address) { console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined..."); } else { console.log("Contract mined! Address: " + contract.address); console.log(contract); } } });

// 	Poll.insert({
//    		text,
//       	createdAt: new Date(), // current time
//     });
//   },
// });