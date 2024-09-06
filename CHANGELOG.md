# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2024-09-07

### Added

- Implemented blacklist functionality to allow users to avoid specific opponents.
- Added blacklist management UI in the extension popup.
- Integrated blacklist feature with contest rating system.

### Changed

- Updated contest processing to consider blacklisted opponents for contests with 5 or fewer entrants.
- Modified rating display to show "X" for contests containing blacklisted opponents.
- Improved error handling and logging for blacklist operations.

### Fixed

- Resolved issues with blacklist persistence between browser sessions.
- Fixed race conditions in contest processing when updating the blacklist.

## [1.0.1] - 2024-09-06

### Added

- Support for the "https://www.draftkings.com/postentry" page.

### Changed

- Unified functionality for lobby and post-entry pages.
- Updated contest grid scanning to accommodate both page layouts.
- Adjusted `scanLobbyPage()` function to handle different cell structures.
- Modified `renderOpponentInfo()` function to handle potentially missing information.

### Fixed

- Improved contest grid scanning for the post-entry page.

## [1.0.0] - 2024-09-04

### Added

- Initial release of the DraftKings Opponents Finder Chrome Extension.
- Contest scanning functionality to analyze DraftKings lobby.
- Opponent analysis based on experience levels (beginner, low, medium, high).
- Rating system for contests based on opponent experience.
- Real-time display of opponent information and ratings in the contest grid.
- Performance optimization through caching of processed contest data.
- Automatic updates as users scroll through the lobby or change filters.
- Visual indicators using color-coding (green, orange, red) for quick assessment.
- Detailed breakdown of opponent experience levels for each contest.
- README with installation instructions for Windows and Mac.
- Development scripts for building, linting, and testing.
- Packaging script for creating distributable ZIP files.

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- N/A (Initial release)
