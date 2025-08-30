# Instagram DM Extension

A Chrome Extension that assists creators and marketers with Instagram outreach. Save profiles while browsing, generate AI-based direct message suggestions, and manage them through a simple campaign dashboard.

## Features
- **Save Instagram usernames** from posts, comments, and follower lists
- **Organize usernames into smart lists** for targeted campaigns
- **Generate personalized DMs** using the OpenAI API
- **Campaign dashboard** for viewing profiles and message suggestions
- **Coming soon:** CSV import/export and contacted/skipped tracking

## Project Structure
- `manifest.json`: Chrome extension configuration
- `popup.html`: Interface for collecting usernames
- `campaign.html`: Dashboard to manage outreach
- `options.html`: Settings page to enter your OpenAI API key
- `content.js`, `popup.js`, `campaign.js`: Front‑end logic for the extension
- `storage.js`: Helpers for storing and retrieving usernames

## How to Use
1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** and click **Load unpacked**
3. Select the project folder
4. Click the extension icon to open the popup
5. Save usernames, open the campaign screen, and generate DMs

## Requirements
- Google Chrome
- OpenAI API key

## License
MIT

## Contact
[Zain5163](https://github.com/Zain5163) — Contributions are welcome!
