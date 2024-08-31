// Listen for installation or update of the extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('DraftKings Opponents Finder installed');
    // TODO: Set default settings
  } else if (details.reason === 'update') {
    console.log('DraftKings Opponents Finder updated');
    // TODO: Handle any necessary updates
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getEligibleContests') {
    // TODO: Implement logic to get and return eligible contests
    sendResponse({contests: []});
  }
  return true; // Indicates that the response will be sent asynchronously
});