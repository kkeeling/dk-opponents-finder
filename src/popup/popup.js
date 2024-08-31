document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleExtension');
  const statusElement = document.getElementById('status');

  // Check the current state of the extension
  chrome.storage.sync.get('extensionEnabled', (data) => {
    const enabled = data.extensionEnabled ?? true; // Default to enabled if not set
    updateUI(enabled);
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

  function updateUI(enabled) {
    toggleButton.textContent = enabled ? 'Disable Extension' : 'Enable Extension';
    statusElement.textContent = enabled ? 'Extension is active' : 'Extension is inactive';
  }
});