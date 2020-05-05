'use strict';

var input = document.getElementById('query');
var results = document.getElementById('results');
var image = document.getElementById('image');
var hint = document.getElementById('press-enter');
var shortcut = document.getElementById('shortcut');

var selectedItem = null;

updateVisibility();
initLinks();

chrome.commands.getAll(function(commands) {
  if (commands && commands.length) {
    shortcut.style.display = 'none';
  }
});

document.addEventListener('keydown', function(event) {
  var isUpArrow = event.keyCode == '38';
  var isDownArrow = event.keyCode == '40';
  var isEnter = event.keyCode == '13';

  var isHandled = false;
  if (isUpArrow) {
    selectPrevious();
    isHandled = true;
  }

  if (isDownArrow) {
    selectNext(); 
    isHandled = true;
  }

  if (isEnter) {
    openWebsite();
    isHandled = true;
  }

  if (isHandled) {
    event.preventDefault();
    event.stopPropagation();
  }
});

input.addEventListener('input', function() {
  var url = getGermanToEnglishUrl(input.value);
  request(url, onReceiveResult, onError);
});

function selectNext() {
  if (selectedItem === null) {
    selectedItem = 0;
  } else {
    selectedItem++;
  } 
  updateSelectedItem();
}

function selectPrevious() {
  if (selectedItem === 0) {
    selectedItem = null;
  } else {
    selectedItem--;
  } 
  updateSelectedItem();
}

function updateSelectedItem() {
  var allItems = document.getElementsByClassName('autocompletion_item');
  var allCurrentlySelected = document.getElementsByClassName('autocompletion_item selected');
  for (var i = 0; i < allCurrentlySelected.length; i++) {
    allCurrentlySelected.item(i).classList.remove('selected');
  }

  var newlySelectedItem = allItems.item(selectedItem);
  if (newlySelectedItem) {
    newlySelectedItem.classList.add('selected');
    scrollIntoViewIfNeeded(newlySelectedItem);
  }
}

function scrollIntoViewIfNeeded(target) {
  var rect = target.getBoundingClientRect();
  if (rect.bottom > window.innerHeight) {
    target.scrollIntoView(false);
  }
  if (rect.top < 0) {
    target.scrollIntoView();
  } 
}

function getGermanToEnglishUrl(query) {
  return 'https://www.linguee.com/english-german/?source=autosearch&qe=' + query;
} 

function onReceiveResult(result) {
  selectedItem = null;
  results.innerHTML = result;
  updateVisibility();
}

function onError() {
  console.log('error');
}

function openWebsite() {
  var query = input.value;
  if (!input.value) {
    return;
  }

  var url = 'https://www.linguee.com/english-german/search?source=auto&query=' + query;
  chrome.tabs.create({url: url});
}

function updateVisibility() {
  var hasResults = hasAutocompleteResults();
  image.style.display = hasResults ? 'none' : 'block';
  hint.style.display = hasResults ? 'block' : 'none';
}

function hasAutocompleteResults() {
  var autocompletionItems = results.getElementsByClassName('autocompletion');
  if (autocompletionItems.length === 0) {
    return false;
  } 
  return !!results.getElementsByClassName('autocompletion')[0].children.length
}

function request(url, success, error) {
  // Set up our HTTP request
  var xhr = new XMLHttpRequest();

  // Setup our listener to process completed requests
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      success(xhr.responseText);
    } else {
      error();
    }
  };

  xhr.open('GET', url);
  xhr.send();
}

function initLinks() {
  var links = document.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    link.addEventListener('click', function(event) {
      var href = link.getAttribute('href');
      chrome.tabs.create({url: href});
      event.preventDefault();
      event.stopPropagation();
    });
  }
}