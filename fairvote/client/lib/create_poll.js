import { Polls } from '../../imports/api/polls.js';

Template.createpoll.onRendered(function () {
  // Initiate datetime picker
  $('.datetimepicker').datetimepicker({
    allowInputToggle: true,
  });
});

Template.createpoll.events({
  // Called when user attemps to create new poll
  'submit .new-poll'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get target (form)
    const target = event.target;

    // Check if form is valid
    var valid = validatePollForm(target);
    if (!valid) {
      return;
    }

    // Get input poll data from target
    const title = target.title.value;
    const pollType = target.pollType.value;
    const maxVoters = target.maxVoters.value;
    const finishDate = Date.parse(target.finishDate.value);

    // Make array of choices entered by the user
    var choiceFields = target.children.item(2).children;
    var choices = [];
    for (var i=0; i < choiceFields.length; i+=1) {
      choices.push(choiceFields[i].value);
    }

    // Insert a poll into the collection
    var pollID = Polls.insert({
      title: title,
      pollType: pollType,
      choices: choices,
      maxVoters: maxVoters,
      finishDate: finishDate,
      active: true,
      owner: Session.get("currentEthAccount"),
      voters: [],
      rawBallots: [],
      createdAt: new Date(), // current time
    });

    // Get created poll
    poll = Polls.findOne(pollID);

    // Set timer for finish date of poll on server
    Meteor.call('updateFinishDateTimer', poll, function (error, result) {});
 
    // Clear form fields for next use
    target.title.value = '';
    target.pollType.value = '';
    target.pollType.style.color = "#999";
    for (var i=0; i < choiceFields.length; i++) {
      choiceFields[i].value = '';
    }
    target.maxVoters.value = '';
    target.finishDate.value = '';

    // Get number of choice fields from session variable
    var numChoiceFields = Session.get("choiceFields");

    // Reset number of choice fields to 2 for next use
    while (numChoiceFields > 2) {
      $('.poll-choices').children()[numChoiceFields-1].remove();
      numChoiceFields -= 1;
    }

    // Update session variable
    Session.set("choiceFields", numChoiceFields);

    // Hide UI sections
    $(".vote-section").hide();
    $(".view-votes-section").hide();

    Notifications.info('Info', 'Your poll is waiting to be mined.');
  },
  // Called when user attemps to add choice field on create poll form
  'click .add-choice'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update number of choice fields in session variable
    var numChoiceFields = Session.get("choiceFields");
    numChoiceFields += 1;
    Session.set("choiceFields", numChoiceFields)

    // Append another choice field to HTML
    $('.poll-choices').append("<input type='text' class='form-control' name='choice" + numChoiceFields + "' placeholder='Poll Choice " + numChoiceFields + "' />");
  },
  // Called when user attemps to remove choice field on create poll form
  'click .remove-choice'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update number of choice fields in session variable
    var numChoiceFields = Session.get("choiceFields");
    if (numChoiceFields > 2) {
      // Remove choice field from HTML
      $('.poll-choices').children()[numChoiceFields-1].remove()
      numChoiceFields -= 1;
      Session.set("choiceFields", numChoiceFields)
    }
  },
  // Called when user changes the poll type field
  'change .select-poll-field'(event) {
    // Change text colour to match other form fields
    event.target.style.color = "#555";
  },
});