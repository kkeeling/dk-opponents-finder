// Function to check if we're on the DraftKings lobby page
function isDraftKingsLobbyPage() {
  return window.location.hostname === 'www.draftkings.com' &&
         window.location.pathname.includes('/lobby');
}

// Function to scan the lobby page for contests
function scanLobbyPage() {
  const contestRows = document.querySelectorAll('.lobby-card');
  const contests = [];

  contestRows.forEach(row => {
    const contestId = row.getAttribute('data-contest-id');
    const entryCount = row.querySelector('.entries-count')?.textContent.trim();

    if (contestId && entryCount) {
      const numEntries = parseInt(entryCount, 10);
      if (numEntries <= 5) {
        contests.push({ id: contestId, entries: numEntries });
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

// Main function to run when the content script is injected
async function main() {
  if (isDraftKingsLobbyPage()) {
    console.log('DraftKings Opponents Finder: Scanning lobby page...');
    const eligibleContests = scanLobbyPage();
    console.log('Eligible contests:', eligibleContests);
    
    if (eligibleContests.length > 0) {
      console.log('Fetching contest details...');
      const processedContests = await fetchAndProcessContests(eligibleContests);
      console.log('Processed contests:', processedContests);
      // TODO: Use processedContests to update the UI or send to background script
    }
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