# JavaScript Error Visualizer User Guide

This guide will help you get the most out of the JavaScript Error Visualizer extension, a tool designed to make JavaScript debugging more intuitive by visually highlighting DOM elements associated with errors.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Main Features](#main-features)
4. [Extension Panel](#extension-panel)
5. [Settings](#settings)
6. [Troubleshooting](#troubleshooting)
7. [Tips and Best Practices](#tips-and-best-practices)

## Installation

### Chrome/Edge

1. Download the extension from the Chrome Web Store (coming soon).
2. Click "Add to Chrome" and confirm the installation.

### Firefox

1. Download the extension from Firefox Add-ons (coming soon).
2. Click "Add to Firefox" and confirm the installation.

### Manual Installation

1. Download or clone the repository from GitHub.
2. Build the extension:
   ```
   npm install
   npm run build
   ```
3. Load the extension in your browser:
   - Chrome/Edge: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select the `dist` folder.
   - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` folder.

## Getting Started

1. After installation, you'll see the JavaScript Error Visualizer icon in your browser toolbar.
2. The extension is enabled by default. You can click the icon to open the extension panel and toggle it on/off.
3. Browse websites as you normally would. When a JavaScript error occurs, the associated DOM element will be highlighted on the page.
4. Click the extension icon to see a list of all errors detected on the current page.

## Main Features

### Visual Error Highlighting

- DOM elements associated with JavaScript errors are automatically highlighted with a dashed red border (default style).
- Hovering over a highlighted element shows a tooltip with error information.
- Clicking a highlighted element opens the extension panel and focuses on the corresponding error.

### Error Capture

The extension captures:
- Uncaught runtime exceptions (window.onerror)
- Unhandled promise rejections (window.onunhandledrejection)
- Console.error messages (optional, disabled by default)

### Source Map Integration

- The extension automatically detects and uses JavaScript source maps if available.
- This translates minified/transpiled code back to the original source, making error locations more meaningful.

## Extension Panel

The extension panel provides a detailed view of all captured errors:

### Error List

- Shows all errors detected on the current page.
- Each entry displays:
  - Error message summary
  - File name and line number
  - Timestamp
  - Error count (if the same error occurred multiple times)
  - Visual indicator if the error is linked to a DOM element

### Error Details

Clicking an error in the list shows:
- Full error message
- Complete stack trace (source-mapped if available)
- Links to associated DOM elements
- Option to clear this specific error

### Search and Filter

- Search box: Filter errors by keyword in the message or file name
- Filter dropdown: Filter by error type (runtime, promise, console)

### Controls

- Enable/Disable toggle: Quickly enable or disable the extension
- Clear All button: Remove all error highlights and clear the error list
- Settings button: Access the extension settings

## Settings

The settings page allows you to customize the extension's behavior:

### General Settings

- **Enable Extension Globally**: Master toggle for the extension
- **Automatically Clear Errors on Page Reload**: Whether errors should persist across page reloads
- **Capture console.error Messages**: Whether to treat console.error calls as errors
- **Icon Badge Shows**: Configure what the badge counter on the extension icon shows (total or new errors)

### Highlight Customization

- **Highlight Color**: Change the color of the error highlight
- **Border Style**: Choose between dashed, solid, or dotted borders
- **Border Width**: Adjust the thickness of the highlight border
- **Use Background Overlay**: Add a semi-transparent background to highlighted elements
- **Background Opacity**: Adjust the opacity of the background overlay

### Domain Settings

- **Domain List Type**: Choose between allowlist (only enable on listed domains) or blocklist (disable on listed domains)
- **Domain List**: Add or remove domains from the list

### Ignored Errors

- Add patterns (including regular expressions) to ignore specific types of errors
- Useful for filtering out known issues or third-party errors you can't fix

### Advanced Settings

- **Source Map Fetch Timeout**: Maximum time to wait when fetching source maps
- **Source Map Fetch Retries**: Number of retry attempts for failed source map fetches

## Troubleshooting

### Extension Not Working

1. Check if the extension is enabled (click the icon and check the toggle).
2. Check if the current domain is blocked in your domain settings.
3. Try reloading the page.
4. Check if there are any JavaScript errors on the page (open the browser's developer console).

### No Elements Highlighted

1. The extension might not be able to associate the error with a specific DOM element.
2. Check the extension panel to see if errors are being detected.
3. Some errors (like those in background tasks or utility functions) might not be directly associated with any visible element.

### Source Maps Not Working

1. Ensure source maps are available for the website you're debugging.
2. Check if the source map URL is correct and accessible.
3. Try increasing the source map fetch timeout in the advanced settings.

## Tips and Best Practices

### For Better Element Identification

- Use descriptive IDs and classes for your DOM elements.
- Attach event listeners directly to the elements they affect.
- Use proper error handling in your code (try/catch blocks).

### For Performance

- Disable the extension on sites where you don't need it.
- Consider disabling automatic source map processing if you don't need it.
- Clear errors regularly, especially on pages with many errors.

### For Debugging

- Use the extension in combination with the browser's developer tools.
- Check both the visual highlights and the extension panel for a complete picture.
- Use the search and filter features to focus on specific types of errors.

---

We hope this guide helps you make the most of JavaScript Error Visualizer. If you have any questions or feedback, please [open an issue](https://github.com/chirag127/JavaScript-Error-Visualizer-browser-extension/issues) on our GitHub repository.
