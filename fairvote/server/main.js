import { Meteor } from 'meteor/meteor';
import '../imports/api/polls.js';

web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8080'));

Meteor.startup(() => {
  // code to run on server at startup
});
