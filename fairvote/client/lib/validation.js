validatePollForm = function(target) {
  // Check title is valid
  var title = target.title.value;
  if (title == "") {
    Notifications.error('Error', 'Poll title cannot be empty. Please enter a poll title.');
    return false;
  }

  // Check poll type is valid
  var pollType = target.pollType.value;
  if (pollType == "") {
    Notifications.error('Error', 'Poll type cannot be empty. Please select a poll type.');
    return false;
  }

  // Check if choice fields are valid
  var numChoiceFields = Session.get("choiceFields");
  var choiceFields = target.children.item(2).children;
  for (var i=0; i < choiceFields.length; i+=1) {
    if (choiceFields[i].value == "") {
      Notifications.error('Error', 'Choices cannot be empty. Please enter text for each choice.');
      return false;
    }
  }

  // Check maximum voters is valid
  var maxVoters = target.maxVoters.value;
  if (maxVoters == "") {
    Notifications.error('Error', 'Maximum voters cannot be empty. Please enter a value for maximum voters.');
    return false;
  }
  if (maxVoters == "0") {
    Notifications.error('Error', 'Maximum voters cannot be zero. Please enter a positive value for maximum voters.');
    return false;
  }

  // Check finish date is valid
  var finishDate = target.finishDate.value;
  if (finishDate == "") {
    Notifications.error('Error', 'Finish date cannot be empty. Please select a finish date.');
    return false;
  }
  finishDate = new Date(finishDate);
  if (finishDate <= Date.now()) {
    Notifications.error('Error', 'Finish date cannot be in the past. Please select a finish date in the future.');
    return false;
  }

  return true;
}

validateFPTPPoll = function(target) {
  var choice = target.choice.value;

  // If no choice selected, display error to user
  if (choice == "") {
      Notifications.error('Error', 'You need to select at least one choice. Please select a choice.');
      return false;
  }

  return true;
}

validateAPRVPoll = function(target) {
  var choiceSelected = false;

  // Check if any choices have been selected by the user
  for (var i=0; i < target.choice.length; i++) {
    if (target.choice[i].checked) {
      choiceSelected = true;
    }
  }

  // If no choices have been selected, display error to user
  if (!choiceSelected) {
    Notifications.error('Error', 'You need to select at least one choice. Please select a choice.');
    return false;
  }

  return true;
}

validateALTRPoll = function(target) {
  // Get list of preference elements
  var preferencesElements = target.preference;

  // For each preference element, push the selected value to an array
  var preferences = [];
  for (var i = 0; i < preferencesElements.length; i++) {
    preferences.push(preferencesElements[i].value);
  }

  // Sort the array of preferences to get them in order 
  var sortedPreferences = preferences.slice().sort();

  // Iterate through sorted array of preferences
  for (var i = 0; i < sortedPreferences.length; i++) {
    // If two consecutive preferences are equal, display error to user
    if (sortedPreferences[i + 1] == sortedPreferences[i]) {
        Notifications.error('Error', 'You cannot select the same preference more than once. Please remove any duplicates.');
        return false;
    }
  }

  return true;
}