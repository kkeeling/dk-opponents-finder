// Initialize blacklist
let blacklist = [];

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleExtension');
  const statusElement = document.getElementById('status');
  const addToBlacklistButton = document.getElementById('addToBlacklist');
  const blacklistUsernameInput = document.getElementById('blacklistUsername');

  // Check the current state of the extension and load the blacklist
  chrome.storage.sync.get(['extensionEnabled', 'blacklist'], (data) => {
    const enabled = data.extensionEnabled ?? true; // Default to enabled if not set
    updateUI(enabled);
    blacklist = data.blacklist || []; // Load the blacklist
    displayBlacklist(); // Display the loaded blacklist
  });

  // Toggle the extension state when the button is clicked
  toggleButton.addEventListener('click', () => {
    chrome.storage.sync.get('extensionEnabled', (data) => {
      const currentState = data.extensionEnabled ?? true;
      const newState = !currentState;
      chrome.storage.sync.set({ extensionEnabled: newState }, () => {
        updateUI(newState);
      });
    });
  });

  // Add username to blacklist
  addToBlacklistButton.addEventListener('click', () => {
    addToBlacklist(blacklistUsernameInput.value);
    blacklistUsernameInput.value = '';
  });

  function updateUI(enabled) {
    toggleButton.textContent = enabled ? 'Disable Extension' : 'Enable Extension';
    statusElement.textContent = enabled ? 'Extension is active' : 'Extension is inactive';
  }

  function addToBlacklist(username) {
    username = username.trim().toLowerCase();
    if (username && !blacklist.includes(username)) {
      blacklist.push(username);
      saveBlacklist(); // Save after adding
      displayBlacklist();
    }
  }

  function removeFromBlacklist(username) {
    blacklist = blacklist.filter(u => u !== username);
    saveBlacklist(); // Save after removing
    displayBlacklist();
  }

  function saveBlacklist() {
    chrome.storage.sync.set({ blacklist }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving blacklist:', chrome.runtime.lastError);
      } else {
        console.log('Blacklist saved successfully');
      }
    });
  }

  function displayBlacklist() {
    const blacklistElement = document.getElementById('blacklist');
    blacklistElement.innerHTML = '';
    blacklist.forEach(username => {
      const li = document.createElement('li');
      li.textContent = username;
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.onclick = () => removeFromBlacklist(username);
      li.appendChild(removeButton);
      blacklistElement.appendChild(li);
    });
  }
});
