// Function to check if we're on the DraftKings lobby page
function isDraftKingsLobbyPage() {
  const isLobbyPage =
    window.location.hostname === "www.draftkings.com" &&
    window.location.pathname.includes("/lobby");
  console.log("DraftKings Opponents Finder: Is lobby page?", isLobbyPage);
  return isLobbyPage;
}

// Function to scan the lobby page for contests
function scanLobbyPage() {
  console.log("DraftKings Opponents Finder: Scanning lobby page");
  const contestRows = document.querySelectorAll(".slick-row");
  console.log(
    "DraftKings Opponents Finder: Found contest rows:",
    contestRows.length
  );
  const contests = [];

  contestRows.forEach((row, index) => {
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

      if (contestId && (contestStyle === "Classic" || contestStyle === "Showdown Captain Mode")) {
        contests.push({
          id: contestId,
          name: contestName,
          style: contestStyle,
          entryFee: entryFee,
          currentEntries: currentEntries,
          maxEntries: maxEntries,
          startTime: startTime,
        });
        console.log(
          `DraftKings Opponents Finder: Found eligible contest - ID: ${contestId}, Name: ${contestName}, Style: ${contestStyle}, Max Entries: ${maxEntries}`
        );
      }
    }
  });

  console.log(
    "DraftKings Opponents Finder: Total eligible contests found:",
    contests.length
  );
  return contests;
}

// Function to construct the contest detail URL
function getContestDetailUrl(contestId) {
  return `https://www.draftkings.com/contest/detailspop?contestId=${contestId}`;
}

// Function to fetch contest details
async function fetchContestDetails(contestId) {
  const url = getContestDetailUrl(contestId);
  console.log(
    `DraftKings Opponents Finder: Fetching details for contest ID ${contestId}`
  );
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(
      `DraftKings Opponents Finder: Successfully fetched details for contest ID ${contestId}`
    );
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
  console.log(
    `DraftKings Opponents Finder: Cached processed data for contest ID ${contestId}`
  );
}

// Function to get contest details with caching
async function getContestDetails(contestId) {
  const cachedData = contestCache.get(contestId);
  const cacheExpiration = 5 * 60 * 1000; // 5 minutes

  if (cachedData && Date.now() - cachedData.timestamp < cacheExpiration) {
    console.log(
      `DraftKings Opponents Finder: Using cached data for contest ID ${contestId}`
    );
    return cachedData.data;
  }

  console.log(
    `DraftKings Opponents Finder: Cache miss for contest ID ${contestId}, fetching fresh data`
  );
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
  console.log("DraftKings Opponents Finder: Processing contest details");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const entrantsTable = doc.querySelector("#entrants-table");

  if (!entrantsTable) {
    console.error("DraftKings Opponents Finder: Could not find entrants table");
    return null;
  }

  const entrants = entrantsTable.querySelectorAll("tr");
  console.log("DraftKings Opponents Finder: Found entrants:", entrants.length);

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

  console.log(
    "DraftKings Opponents Finder: Processed opponent info:",
    opponentInfo
  );
  return opponentInfo;
}

// Function to fetch and process contest details with throttling
async function fetchAndProcessContests(contests) {
  console.log(
    "DraftKings Opponents Finder: Fetching and processing contests:",
    contests.length
  );
  const processedContests = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const contest of contests) {
    const opponentInfo = await getContestDetails(contest.id);
    if (opponentInfo) {
      processedContests.push({ ...contest, opponentInfo });
      console.log(
        `DraftKings Opponents Finder: Processed contest ID ${contest.id}`
      );
    }
    await delay(1000); // 1 second delay between requests
  }

  console.log(
    "DraftKings Opponents Finder: Total processed contests:",
    processedContests.length
  );
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
  console.log(
    `DraftKings Opponents Finder: Rendering info for contest ID ${contest.id}`
  );
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

  return container;
}

// Function to handle contest grid changes
async function handleContestGridChanges() {
  console.log("DraftKings Opponents Finder: Handling contest grid changes");
  const eligibleContests = scanLobbyPage();
  console.log(
    "DraftKings Opponents Finder: Eligible contests:",
    eligibleContests.length
  );

  if (eligibleContests.length > 0) {
    console.log("DraftKings Opponents Finder: Fetching contest details...");
    const processedContests = await fetchAndProcessContests(eligibleContests);
    console.log(
      "DraftKings Opponents Finder: Processed contests:",
      processedContests.length
    );

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

          console.log("Rendering info for contest ID", contest.id);
          const infoElement = renderOpponentInfo(contest);
          liveCell.appendChild(infoElement);
          console.log(
            `DraftKings Opponents Finder: Rendered info for contest ID ${contest.id}`
          );
        } else {
          console.log(
            `DraftKings Opponents Finder: Could not find live cell for contest ID ${contest.id}`
          );
        }
      } else {
        console.log(
          `DraftKings Opponents Finder: Could not find row for contest ID ${contest.id}`
        );
      }
    });
  } else {
    console.log("DraftKings Opponents Finder: No eligible contests found");
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
    console.error("DraftKings Opponents Finder: Could not find contest grid");
    return;
  }

  console.log("DraftKings Opponents Finder: Setting up MutationObserver");
  const observerOptions = {
    childList: true,
    subtree: true,
  };

  const observer = new MutationObserver(debouncedHandleContestGridChanges);
  observer.observe(targetNode, observerOptions);
  console.log(
    "DraftKings Opponents Finder: MutationObserver set up successfully"
  );
}

// Main function to run when the content script is injected
async function main() {
  console.log("DraftKings Opponents Finder: Main function called");
  if (isDraftKingsLobbyPage()) {
    console.log("DraftKings Opponents Finder: Initializing on lobby page...");
    setupContestGridObserver(); // Set up observer for changes
    // Initial scan after a delay to allow page to load completely
    console.log("DraftKings Opponents Finder: Scheduling initial scan");
    setTimeout(() => {
      console.log("DraftKings Opponents Finder: Executing initial scan");
      handleContestGridChanges();
    }, 2000);
  } else {
    console.log("DraftKings Opponents Finder: Not on lobby page, exiting");
  }
}

// Run the main function when the page is fully loaded
window.addEventListener("load", () => {
  console.log(
    "DraftKings Opponents Finder: Page loaded, running main function"
  );
  main();
});

// Also run the main function when the URL changes (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log(
      "DraftKings Opponents Finder: URL changed, running main function"
    );
    main();
  }
}).observe(document, { subtree: true, childList: true });

// Add event listeners for scroll and resize events
window.addEventListener("scroll", () => {
  console.log("DraftKings Opponents Finder: Scroll event detected");
  debouncedHandleContestGridChanges();
});
window.addEventListener("resize", () => {
  console.log("DraftKings Opponents Finder: Resize event detected");
  debouncedHandleContestGridChanges();
});
