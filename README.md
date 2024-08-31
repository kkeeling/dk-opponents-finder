# DraftKings Opponents Finder Chrome Extension

This Chrome extension helps users quickly identify contests with less experienced opponents on DraftKings.

## Features

- Scans the DraftKings lobby page for contests with 5 or fewer entries.
- Analyzes opponent experience levels based on their badges.
- Provides a visual overlay to highlight contests with less experienced opponents.

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

## License

This project is licensed under the ISC License.

## Disclaimer

This extension is for educational purposes only. Always comply with DraftKings' terms of service and community guidelines when using this extension.