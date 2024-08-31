# DraftKings Opponents Finder Chrome Extension

This Chrome extension helps users quickly identify the experience level of opponents in DraftKings contests.

## Features

- Scans the DraftKings lobby page for all contests.
- Analyzes opponent experience levels based on their badges.
- Calculates a rating for each contest based on the experience levels of current opponents.
- Displays opponent information directly in the contest grid.
- Caches processed contest data for improved performance.

## Latest Updates

- Enhanced opponent categorization: Opponents are accurately categorized into beginner, low, medium, and high experience levels.
- Rating system: Each contest now has a rating calculated based on the experience levels of current opponents.
- Improved caching: Processed contest data is now cached for faster subsequent requests.
- Updated UI: The extension now displays detailed opponent information and ratings for all contests in the Live column.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/dk-opponents-finder.git
   ```
2. Navigate to the project directory:
   ```
   cd dk-opponents-finder
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Build the extension:
   ```
   npm run build
   ```
5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder in the project directory

## Development

- Run the development build with watch mode:
  ```
  npm run dev
  ```
- Lint the code:
  ```
  npm run lint
  ```
- Run tests:
  ```
  npm test
  ```

## Using the Extension

1. After installing the extension, navigate to the DraftKings lobby page (https://www.draftkings.com/lobby).
2. The extension will automatically process all visible contests.
3. In the Live column of the contest grid, you will see:
   - A rating percentage at the top (color-coded green, orange, or red)
   - A breakdown of opponent experience levels below (B: Beginners, L: Low, M: Medium, H: High)
4. The information updates automatically as you scroll or change filters.

## Testing the Extension

1. Open the Chrome Developer Tools (Right-click > Inspect or F12).
2. Go to the Console tab to view logs from the extension.
3. Scroll through the lobby and observe new contests being processed.
4. Change contest filters and verify that the extension updates accordingly.
5. Refresh the page and check if cached data loads faster for previously viewed contests.
6. Resize the browser window to test responsiveness.
7. Verify that the opponent information is displayed correctly for various contest types and sizes.

## Troubleshooting

If you encounter any issues:
1. Check the console for error messages.
2. Ensure you're logged into DraftKings.
3. Try reloading the extension from the Chrome extensions page.
4. Clear your browser cache and reload the DraftKings lobby.

## License

This project is licensed under the ISC License.

## Disclaimer

This extension is for educational purposes only. Always comply with DraftKings' terms of service and community guidelines when using this extension. The developers are not responsible for any violations or consequences resulting from the use of this extension.