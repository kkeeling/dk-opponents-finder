let blacklist = [];

// Function to load the blacklist from storage
function loadBlacklist() {
  chrome.storage.sync.get(['blacklist'], (result) => {
    blacklist = result.blacklist || [];
    console.log('Loaded blacklist:', blacklist);
    updateVisibleContests(); // Refresh the contest display after loading
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBlacklist") {
    blacklist = request.blacklist;
    console.log('Updated blacklist:', blacklist);
    updateVisibleContests(); // Refresh the contest display
  }
});

// Load the blacklist when the script initializes
loadBlacklist();

// Function to check if we're on the DraftKings lobby or post-entry page
function isDraftKingsLobbyPage() {
  return (
    window.location.hostname === "www.draftkings.com" &&
    (window.location.pathname.includes("/lobby") ||
      window.location.pathname.includes("/postentry"))
  );
}

// Function to scan the lobby or post-entry page for contests
function scanLobbyPage() {
  const contestRows = document.querySelectorAll(".slick-row");
  const contests = [];

  contestRows.forEach((row) => {
    const cells = row.querySelectorAll(".slick-cell");
    if (cells.length >= 6) {
      const nameCell = cells[1].querySelector("a");
      const contestId = nameCell ? nameCell.id.split("_")[1] : null;
      const contestName = nameCell ? nameCell.textContent.trim() : "";
      const entryFeeCell = cells[2].querySelector(".grid-text-with-icon");
      const entryFee = entryFeeCell ? entryFeeCell.textContent.trim() : "";
      const entriesCell = cells[4].querySelector(".grid-text-with-icon");
      const entries = entriesCell ? entriesCell.textContent.split("/") : [];
      const currentEntries = entries[0] ? parseInt(entries[0], 10) : 0;
      const maxEntries = entries[1] ? parseInt(entries[1], 10) : 0;

      if (contestId) {
        contests.push({
          id: contestId,
          name: contestName,
          entryFee: entryFee,
          currentEntries: currentEntries,
          maxEntries: maxEntries,
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
const processedContestIds = new Set();
const processedContestInfo = new Map();

// Function to cache processed data
function cacheProcessedData(contestId, processedData) {
  contestCache.set(contestId, {
    data: processedData,
    timestamp: Date.now(),
  });
  processedContestIds.add(contestId);
}

// Function to get contest details with caching
async function getContestDetails(contestId) {
  const cachedData = contestCache.get(contestId);
  const cacheExpiration = 5 * 60 * 1000; // 5 minutes

  if (cachedData && Date.now() - cachedData.timestamp < cacheExpiration) {
    return cachedData.data;
  }

  const details = await fetchContestDetails(contestId);
  if (details) {
    const processedData = processContestDetails(details);
    cacheProcessedData(contestId, processedData);
    return processedData;
  }
  return null;
}

// Function to process contest details and extract opponent information
function processContestDetails(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const entrantsTable = doc.querySelector("#entrants-table");

  if (!entrantsTable) {
    return null;
  }

  const entrants = entrantsTable.querySelectorAll("tr");

  const opponentInfo = {
    beginner: 0,
    lowExperience: 0,
    mediumExperience: 0,
    highExperience: 0,
    totalScore: 0,
    maxScore: 0,
    rating: 0,
    blacklistedOpponents: [], // New field to store blacklisted opponents
  };

  entrants.forEach((entrant) => {
    const cells = entrant.querySelectorAll("td");
    cells.forEach((cell) => {
      if (cell.classList.contains("empty-user")) {
        return; // Skip empty slots
      }

      const usernameElement = cell.querySelector(".player-name");
      const username = usernameElement
        ? usernameElement.textContent.trim().toLowerCase()
        : "";

      console.log(username);
      console.log(blacklist);
      if (blacklist.includes(username)) {
        opponentInfo.blacklistedOpponents.push(username);
      }

      const experienceIcon = cell.querySelector(
        'span[title="Experience Badge"]'
      );
      if (!experienceIcon) {
        opponentInfo.beginner++;
        // No points for beginners
      } else if (experienceIcon.classList.contains("icon-experienced-user-1")) {
        opponentInfo.lowExperience++;
        opponentInfo.totalScore += 1;
      } else if (experienceIcon.classList.contains("icon-experienced-user-3")) {
        opponentInfo.mediumExperience++;
        opponentInfo.totalScore += 2;
      } else if (experienceIcon.classList.contains("icon-experienced-user-5")) {
        opponentInfo.highExperience++;
        opponentInfo.totalScore += 3;
      }
      opponentInfo.maxScore += 3; // Increment max score for each non-empty slot
    });
  });

  // Calculate rating
  opponentInfo.rating =
    opponentInfo.blacklistedOpponents.length > 0
      ? "X"
      : opponentInfo.maxScore > 0
      ? Math.round((opponentInfo.totalScore / opponentInfo.maxScore) * 100)
      : 0;

  return opponentInfo;
}

// Function to fetch and process contest details with throttling
async function fetchAndProcessContests(contests) {
  const processedContests = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const contest of contests) {
    if (!processedContestIds.has(contest.id)) {
      const opponentInfo = await getContestDetails(contest.id);
      if (opponentInfo) {
        processedContests.push({ ...contest, opponentInfo });
        processedContestIds.add(contest.id);
      }
      await delay(1000); // 1 second delay between requests
    }
  }

  return processedContests;
}

// Improved debounce function with immediate option
function debounce(func, wait, immediate = false) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Function to render opponent information and rating
function renderOpponentInfo(contest) {
  const container = document.createElement("span");
  container.className = "dk-opponents-finder-info";
  container.style.cssText = `
    font-size: 11px;
    padding: 2px 4px;
    background-color: #f0f0f0;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  `;

  if (contest.opponentInfo) {
    if (contest.opponentInfo.rating === "X") {
      container.innerHTML = `
        <span style="font-weight: bold; color: red; margin-bottom: 2px;">
          X
        </span>
        <span style="font-size: 9px; color: #888;">
          Blacklisted: ${contest.opponentInfo.blacklistedOpponents.join(", ")}
        </span>
      `;
    } else {
      const ratingColor =
        contest.opponentInfo.rating < 33
          ? "green"
          : contest.opponentInfo.rating < 66
          ? "orange"
          : "red";

      container.innerHTML = `
        <span style="font-weight: bold; color: ${ratingColor}; margin-bottom: 2px;">
          ${contest.opponentInfo.rating}%
        </span>
      `;
    }
  } else {
    container.innerHTML = `
      <span style="font-weight: bold; color: #888;">
        Loading...
      </span>
    `;
  }

  return container;
}

// Function to render loading indicator
function renderLoadingIndicator() {
  const container = document.createElement("span");
  container.className = "dk-opponents-finder-loading";
  container.style.cssText = `
    font-size: 11px;
    padding: 2px 4px;
    background-color: #f0f0f0;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  `;

  container.innerHTML = `
    <span style="font-weight: bold; color: #888;">
      Loading...
    </span>
  `;

  return container;
}

// Function to handle contest grid changes
async function handleContestGridChanges() {
  const eligibleContests = scanLobbyPage();
  const newContests = eligibleContests.filter(
    (contest) => !processedContestIds.has(contest.id)
  );

  if (newContests.length > 0) {
    // Process contests in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < newContests.length; i += batchSize) {
      const batch = newContests.slice(i, i + batchSize);
      const processedContests = await fetchAndProcessContests(batch);

      processedContests.forEach((contest) => {
        processedContestInfo.set(contest.id, contest);
      });

      // Update UI for the processed batch
      updateVisibleContests();

      // Allow some time for the UI to update before processing the next batch
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } else {
    updateVisibleContests();
  }
}

// Function to update visible contests
function updateVisibleContests() {
  const visibleContests = scanLobbyPage();
  visibleContests.forEach((contest) => {
    const contestRow = document.querySelector(
      `.slick-row a[id="name_${contest.id}"]`
    );
    if (contestRow) {
      const rowElement = contestRow.closest(".slick-row");
      const liveCell = rowElement.querySelector(".slick-cell:nth-child(7)");
      if (liveCell) {
        const processedContest = processedContestInfo.get(contest.id);
        if (processedContest) {
          if (!liveCell.querySelector(".dk-opponents-finder-info")) {
            liveCell.innerHTML = "";
            const infoElement = renderOpponentInfo(processedContest);
            liveCell.appendChild(infoElement);
          }
        } else if (!liveCell.querySelector(".dk-opponents-finder-loading")) {
          liveCell.innerHTML = "";
          const loadingElement = renderLoadingIndicator();
          liveCell.appendChild(loadingElement);
        }
      }
    }
  });
}

// Throttled version of handleContestGridChanges
const throttledHandleContestGridChanges = throttle(
  handleContestGridChanges,
  5000
);

// Function to set up the MutationObserver
function setupContestGridObserver() {
  const targetNode = document.querySelector(".grid-canvas");
  if (!targetNode) {
    return;
  }

  const observerOptions = {
    childList: true,
    subtree: true,
  };

  const observer = new MutationObserver(throttledHandleContestGridChanges);
  observer.observe(targetNode, observerOptions);
}

// Main function to run when the content script is injected
async function main() {
  if (isDraftKingsLobbyPage()) {
    loadBlacklist(); // Load the blacklist
    setupContestGridObserver(); // Set up observer for changes
    // Initial scan after a delay to allow page to load completely
    setTimeout(handleContestGridChanges, 2000);
  }
}

// Run the main function when the page is fully loaded
window.addEventListener("load", main);

// Also run the main function when the URL changes (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    main();
  }
}).observe(document, { subtree: true, childList: true });

// Add throttled event listeners for scroll and resize events
window.addEventListener("scroll", throttle(updateVisibleContests, 500));
window.addEventListener("resize", throttle(updateVisibleContests, 500));

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
