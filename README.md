# DraftKings Opponents Finder Chrome Extension

This Chrome extension enhances your DraftKings experience by helping you quickly identify the experience level of opponents in various contests. It provides valuable insights directly in the DraftKings lobby, allowing you to make more informed decisions when choosing contests to enter.

## Detailed Summary

The DraftKings Opponents Finder Chrome Extension offers the following key features:

1. **Contest Scanning**: Automatically scans the DraftKings lobby page for all available contests.
2. **Opponent Analysis**: Analyzes the experience levels of opponents in each contest based on their DraftKings badges.
3. **Rating System**: Calculates a unique rating for each contest based on the current opponents' experience levels.
4. **Real-time Display**: Shows opponent information and ratings directly in the contest grid, specifically in the Live column.
5. **Performance Optimization**: Implements caching of processed contest data to improve loading times and reduce API calls.
6. **Automatic Updates**: Continuously updates information as you scroll through the lobby or change contest filters.
7. **Visual Indicators**: Uses color-coding (green, orange, red) to quickly convey the overall experience level of opponents in each contest.

## Features

- **Enhanced Opponent Categorization**: Accurately categorizes opponents into beginner, low, medium, and high experience levels.
- **Dynamic Rating System**: Each contest receives a rating percentage based on the current mix of opponent experience levels.
- **Efficient Caching**: Processed contest data is cached for faster loading on subsequent views.
- **Responsive UI**: The extension's display adapts to changes in the DraftKings lobby, including scrolling and filter adjustments.
- **Detailed Breakdown**: Provides a summary of opponent experience levels for each contest (B: Beginners, L: Low, M: Medium, H: High).

## Installation Instructions

### Option 1: Install from ZIP file (Recommended for most users)

1. Download the latest release ZIP file from the [Releases page](https://github.com/kkeeling/dk-opponents-finder/tree/main/releases).
2. Unzip the file to a location on your computer.
3. Open Google Chrome and go to `chrome://extensions/`.
4. Enable "Developer mode" in the top right corner.
5. Click "Load unpacked" and select the folder you just unzipped.
6. The extension should now be installed and ready to use.

### Option 2: Install from source (For developers)

#### For Windows:

1. Download the extension:
   - Open a Command Prompt (Press Win + R, type `cmd`, and press Enter)
   - Navigate to your desired directory (e.g., `cd C:\Users\YourUsername\Documents`)
   - Clone the repository:
     ```
     git clone https://github.com/yourusername/dk-opponents-finder.git
     ```
   - Navigate to the project directory:
     ```
     cd dk-opponents-finder
     ```

2. Install Node.js:
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify the installation by running:
     ```
     node --version
     npm --version
     ```

3. Install dependencies and build the extension:
   - In the project directory, run:
     ```
     npm install
     npm run build
     ```

4. Load the extension in Chrome:
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Navigate to the `dk-opponents-finder\dist` folder and select it

#### For Mac:

1. Download the extension:
   - Open Terminal
   - Navigate to your desired directory (e.g., `cd ~/Documents`)
   - Clone the repository:
     ```
     git clone https://github.com/yourusername/dk-opponents-finder.git
     ```
   - Navigate to the project directory:
     ```
     cd dk-opponents-finder
     ```

2. Install Node.js:
   - If you have Homebrew installed, run:
     ```
     brew install node
     ```
   - If not, download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify the installation by running:
     ```
     node --version
     npm --version
     ```

3. Install dependencies and build the extension:
   - In the project directory, run:
     ```
     npm install
     npm run build
     ```

4. Load the extension in Chrome:
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Navigate to the `dk-opponents-finder/dist` folder and select it

## Usage

1. After installation, navigate to the DraftKings lobby page (https://www.draftkings.com/lobby).
2. The extension will automatically start processing visible contests.
3. In the Live column of the contest grid, you'll see:
   - A rating percentage at the top (color-coded green, orange, or red)
   - A breakdown of opponent experience levels (B: Beginners, L: Low, M: Medium, H: High)
4. The information updates automatically as you scroll or change filters.

## Installation from ZIP file

1. Download the ZIP file containing the extension.
2. Unzip the file to a location on your computer.
3. Open Google Chrome and go to `chrome://extensions/`.
4. Enable "Developer mode" in the top right corner.
5. Click "Load unpacked" and select the folder you just unzipped.
6. The extension should now be installed and ready to use.

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

## Troubleshooting

If you encounter any issues:
1. Check the browser console for error messages (Right-click > Inspect > Console tab).
2. Ensure you're logged into DraftKings.
3. Try reloading the extension from the Chrome extensions page.
4. Clear your browser cache and reload the DraftKings lobby.
5. Verify that you're using the latest version of Google Chrome.

## Changelog

For a detailed list of changes for each version, please see the [CHANGELOG.md](CHANGELOG.md) file.

## License

This project is licensed under the ISC License.

## Disclaimer

This extension is for educational and informational purposes only. Always comply with DraftKings' terms of service and community guidelines when using this extension. The developers are not responsible for any violations or consequences resulting from the use of this extension. Use at your own risk and discretion.
