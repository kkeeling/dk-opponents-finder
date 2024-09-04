// Function to check if we're on the DraftKings lobby page
function isDraftKingsLobbyPage() {
  return (
    window.location.hostname === "www.draftkings.com" &&
    window.location.pathname.includes("/lobby")
  );
}

// Function to scan the lobby page for contests
function scanLobbyPage() {
  const contestRows = document.querySelectorAll(".slick-row");
  const contests = [];

  contestRows.forEach((row) => {
    const cells = row.querySelectorAll(".slick-cell");
    if (cells.length >= 8) {
      const nameCell = cells[1].querySelector("a");
      const contestId = nameCell ? nameCell.id.split("_")[1] : null;
      const contestName = nameCell ? nameCell.textContent : "";
      const styleCell = cells[2].querySelector("a span.grid-text");
      const contestStyle = styleCell ? styleCell.textContent.trim() : "";
      const entryFeeCell = cells[3].querySelector(".grid-text-with-icon");
      const entryFee = entryFeeCell ? entryFeeCell.textContent.trim() : "";
      const entriesCell = cells[5].querySelector(".grid-text-with-icon");
      const entries = entriesCell ? entriesCell.textContent.split("/") : [];
      const currentEntries = entries[0] ? parseInt(entries[0], 10) : 0;
      const maxEntries = entries[1] ? parseInt(entries[1], 10) : 0;
      const startTimeCell = cells[6].querySelector(".cntr");
      const startTime = startTimeCell ? startTimeCell.textContent : "";

      if (
        contestId &&
        (contestStyle === "Classic" || contestStyle === "Showdown Captain Mode")
      ) {
        contests.push({
          id: contestId,
          name: contestName,
          style: contestStyle,
          entryFee: entryFee,
          currentEntries: currentEntries,
          maxEntries: maxEntries,
          startTime: startTime,
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

// Function to cache processed data
function cacheProcessedData(contestId, processedData) {
  contestCache.set(contestId, {
    data: processedData,
    timestamp: Date.now(),
  });
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
  };

  entrants.forEach((entrant) => {
    const cells = entrant.querySelectorAll("td");
    cells.forEach((cell) => {
      if (cell.classList.contains("empty-user")) {
        return; // Skip empty slots
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
    opponentInfo.maxScore > 0
      ? Math.round((opponentInfo.totalScore / opponentInfo.maxScore) * 100)
      : 0;

  return opponentInfo;
}

// Function to fetch and process contest details with throttling
async function fetchAndProcessContests(contests) {
  const processedContests = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const contest of contests) {
    const opponentInfo = await getContestDetails(contest.id);
    if (opponentInfo) {
      processedContests.push({ ...contest, opponentInfo });
    }
    await delay(1000); // 1 second delay between requests
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

  if (eligibleContests.length > 0) {
    // Add loading indicators for eligible contests
    eligibleContests.forEach((contest) => {
      const contestRow = document.querySelector(
        `.slick-row a[id="name_${contest.id}"]`
      );
      if (contestRow) {
        const rowElement = contestRow.closest(".slick-row");
        const liveCell = rowElement.querySelector(".slick-cell:nth-child(7)");
        if (liveCell) {
          // Clear existing content
          liveCell.innerHTML = "";

          const loadingElement = renderLoadingIndicator();
          liveCell.appendChild(loadingElement);
        }
      }
    });

    const processedContests = await fetchAndProcessContests(eligibleContests);

    // Update the UI with processed contest information
    processedContests.forEach((contest) => {
      const contestRow = document.querySelector(
        `.slick-row a[id="name_${contest.id}"]`
      );
      if (contestRow) {
        const rowElement = contestRow.closest(".slick-row");
        const liveCell = rowElement.querySelector(".slick-cell:nth-child(7)");
        if (liveCell) {
          // Clear existing content
          liveCell.innerHTML = "";

          const infoElement = renderOpponentInfo(contest);
          liveCell.appendChild(infoElement);
        }
      }
    });
  }
}

// Debounced version of handleContestGridChanges with a longer delay
const debouncedHandleContestGridChanges = debounce(
  handleContestGridChanges,
  2000
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

  const observer = new MutationObserver(debouncedHandleContestGridChanges);
  observer.observe(targetNode, observerOptions);
}

// Main function to run when the content script is injected
async function main() {
  if (isDraftKingsLobbyPage()) {
    setupContestGridObserver(); // Set up observer for changes
    // Initial scan after a delay to allow page to load completely
    setTimeout(() => {
      handleContestGridChanges();
    }, 2000);
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

// Add event listeners for scroll and resize events
window.addEventListener("scroll", () => {
  console.log("DraftKings Opponents Finder: Scroll event detected");
  debouncedHandleContestGridChanges();
});
