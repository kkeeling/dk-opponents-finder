// Function to check if we're on the DraftKings lobby page
function isDraftKingsLobbyPage() {
  return window.location.hostname === 'www.draftkings.com' &&
         window.location.pathname.includes('/lobby');
}

// Function to scan the lobby page for contests
function scanLobbyPage() {
  const contestRows = document.querySelectorAll('.slick-row');
  const contests = [];

  contestRows.forEach(row => {
    const cells = row.querySelectorAll('.slick-cell');
    if (cells.length >= 8) {
      const nameCell = cells[1].querySelector('a');
      const contestId = nameCell ? nameCell.id.split('_')[1] : null;
      const contestName = nameCell ? nameCell.textContent : '';
      const entryFeeCell = cells[3].querySelector('.grid-text-with-icon');
      const entryFee = entryFeeCell ? entryFeeCell.textContent.trim() : '';
      const entriesCell = cells[5].querySelector('.grid-text-with-icon');
      const entries = entriesCell ? entriesCell.textContent.split('/') : [];
      const currentEntries = entries[0] ? parseInt(entries[0], 10) : 0;
      const maxEntries = entries[1] ? parseInt(entries[1], 10) : 0;
      const startTimeCell = cells[6].querySelector('.cntr');
      const startTime = startTimeCell ? startTimeCell.textContent : '';

      if (contestId && maxEntries <= 5) {
        contests.push({
          id: contestId,
          name: contestName,
          entryFee: entryFee,
          currentEntries: currentEntries,
          maxEntries: maxEntries,
          startTime: startTime
        });
      }
    }
  });

  return contests;
}

// Function to construct the contest detail URL
function getContestDetailUrl(contestId) {
  return `https://www.draftkings.com/contest/detailspop?contestId=${contestId}`;
}

// Function to fetch contest details
async function fetchContestDetails(contestId) {
  const url = getContestDetailUrl(contestId);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching contest details for ID ${contestId}:`, error);
    return null;
  }
}

// Simple in-memory cache
const contestCache = new Map();

// Function to get contest details with caching
async function getContestDetails(contestId) {
  if (contestCache.has(contestId)) {
    return contestCache.get(contestId);
  }

  const details = await fetchContestDetails(contestId);
  if (details) {
    contestCache.set(contestId, details);
  }
  return details;
}

// Function to process contest details and extract opponent information
function processContestDetails(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const entrants = doc.querySelectorAll('#entrants-table .entrants-row');
  
  const opponentInfo = {
    beginner: 0,
    lowExperience: 0,
    mediumExperience: 0,
    highExperience: 0
  };

  entrants.forEach(entrant => {
    const experienceIcon = entrant.querySelector('.experience-icon');
    if (!experienceIcon) {
      opponentInfo.beginner++;
    } else if (experienceIcon.classList.contains('icon-experienced-user-1')) {
      opponentInfo.lowExperience++;
    } else if (experienceIcon.classList.contains('icon-experienced-user-3')) {
      opponentInfo.mediumExperience++;
    } else if (experienceIcon.classList.contains('icon-experienced-user-5')) {
      opponentInfo.highExperience++;
    }
  });

  return opponentInfo;
}

// Function to fetch and process contest details with throttling
async function fetchAndProcessContests(contests) {
  const processedContests = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (const contest of contests) {
    const details = await getContestDetails(contest.id);
    if (details) {
      const opponentInfo = processContestDetails(details);
      processedContests.push({ ...contest, opponentInfo });
    }
    await delay(1000); // 1 second delay between requests
  }

  return processedContests;
}

// Debounce function to limit the rate of function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to handle contest grid changes
async function handleContestGridChanges() {
  console.log('DraftKings Opponents Finder: Detected changes in contest grid, rescanning...');
  const eligibleContests = scanLobbyPage();
  console.log('Eligible contests:', eligibleContests);
  
  if (eligibleContests.length > 0) {
    console.log('Fetching contest details...');
    const processedContests = await fetchAndProcessContests(eligibleContests);
    console.log('Processed contests:', processedContests);
    // TODO: Use processedContests to update the UI or send to background script
  }
}

// Debounced version of handleContestGridChanges
const debouncedHandleContestGridChanges = debounce(handleContestGridChanges, 500);

// Function to set up the MutationObserver
function setupContestGridObserver() {
  const targetNode = document.querySelector('.grid-canvas');
  if (!targetNode) {
    console.error('DraftKings Opponents Finder: Could not find contest grid');
    return;
  }

  const observerOptions = {
    childList: true,
    subtree: true
  };

  const observer = new MutationObserver(debouncedHandleContestGridChanges);
  observer.observe(targetNode, observerOptions);
}

// Main function to run when the content script is injected
async function main() {
  if (isDraftKingsLobbyPage()) {
    console.log('DraftKings Opponents Finder: Initializing on lobby page...');
    await handleContestGridChanges(); // Initial scan
    setupContestGridObserver(); // Set up observer for future changes
  }
}

// Run the main function when the page is fully loaded
window.addEventListener('load', main);

// Also run the main function when the URL changes (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    main();
  }
}).observe(document, { subtree: true, childList: true });
