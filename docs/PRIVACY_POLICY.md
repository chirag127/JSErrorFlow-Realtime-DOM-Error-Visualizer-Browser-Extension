# Privacy Policy for JavaScript Error Visualizer

**Last Updated:** 2023-10-27

## Introduction

JavaScript Error Visualizer is a browser extension designed to help web developers debug JavaScript errors by visually highlighting DOM elements associated with runtime errors. This privacy policy explains what information the extension collects, how it is used, and how it is protected.

## Information Collection and Use

### What We Collect

JavaScript Error Visualizer collects the following information **locally** on your device:

1. **JavaScript Error Data**: The extension captures JavaScript errors that occur on websites you visit while the extension is active. This includes:
   - Error messages
   - Stack traces
   - Source code locations (file names, line numbers, column numbers)
   - Associated DOM elements

2. **Source Maps**: The extension may fetch and process JavaScript source maps from websites to translate minified code back to its original form for better error reporting.

3. **User Settings**: The extension stores your configuration preferences, such as:
   - Highlight styles (colors, border styles)
   - Domain allowlists/blocklists
   - Error filtering preferences
   - Other extension settings

### How We Use the Information

All information collected by JavaScript Error Visualizer is:

1. **Processed Locally**: All data processing occurs entirely within your browser.
2. **Stored Locally**: All data is stored locally on your device using browser storage APIs (chrome.storage).
3. **Never Transmitted**: No error data, source code snippets, or website content is ever transmitted to external servers.

## Data Storage

- **Error Data**: Stored temporarily in memory and/or local browser storage. This data is cleared when you close the tab, reload the page, or manually clear errors through the extension interface (depending on your settings).
- **User Settings**: Stored in the browser's local storage (chrome.storage.sync or chrome.storage.local) and persists between browser sessions.

## Permissions

JavaScript Error Visualizer requires the following permissions:

- **storage**: To save your extension settings.
- **scripting**: To inject content scripts that capture and process errors.
- **tabs**: To associate errors with specific browser tabs.
- **host permissions** (`<all_urls>`): To access and process JavaScript errors on websites you visit.

## Third-Party Services

JavaScript Error Visualizer does not use any third-party services, analytics, or tracking tools. All functionality is self-contained within the extension.

## Data Security

Since all data is processed and stored locally on your device, the security of your data depends on the security of your browser and operating system. The extension does not introduce any additional security risks beyond those inherent to your browser.

## Children's Privacy

JavaScript Error Visualizer is a developer tool and is not intended for use by children under 13 years of age.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:

- GitHub Issues: [https://github.com/chirag127/JavaScript-Error-Visualizer-browser-extension/issues](https://github.com/chirag127/JavaScript-Error-Visualizer-browser-extension/issues)
- Email: [your-email@example.com]

## Consent

By using JavaScript Error Visualizer, you consent to our Privacy Policy and agree to its terms.
