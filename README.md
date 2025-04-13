# JavaScript Error Visualizer

![JavaScript Error Visualizer Logo](extension/assets/icons/icon128.png)

A browser extension that visually highlights DOM elements associated with JavaScript errors, making debugging faster and more intuitive.

## Features

-   **Visual Error Highlighting**: Automatically highlights DOM elements associated with JavaScript errors directly on the webpage.
-   **Comprehensive Error Capture**: Captures uncaught exceptions, unhandled promise rejections, and optionally console.error messages.
-   **Source Map Integration**: Translates stack traces from minified/transpiled code back to the original source code.
-   **Detailed Error Information**: Provides tooltips with error messages and source information when hovering over highlighted elements.
-   **Error Management Panel**: Lists all captured errors with filtering and search capabilities.
-   **Customizable Highlighting**: Allows users to customize the highlight style (color, border style, opacity).
-   **Domain-specific Settings**: Enable/disable the extension for specific domains.

## Installation

### From Web Store

_Coming soon_

### Manual Installation

1. Clone this repository:

    ```
    git clone https://github.com/chirag127/JavaScript-Error-Visualizer-browser-extension.git
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Build the extension:

    ```
    npm run build
    ```

4. Load the extension in your browser:
    - Chrome/Edge: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select the `dist` folder.
    - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` folder.

## Development

### Setup

1. Clone the repository and install dependencies as described above.

2. Start the development build with auto-reload:

    ```
    npm run dev
    ```

3. Load the extension from the `dist` folder as described in the installation section.

### Project Structure

```
/
├── extension/
│   ├── manifest.json          # Extension manifest
│   ├── assets/                # Static assets
│   │   ├── icons/             # Extension icons
│   │   ├── css/               # Stylesheets
│   ├── html/                  # HTML files
│   │   ├── popup.html         # Extension popup
│   │   ├── settings.html      # Settings page
│   ├── js/                    # JavaScript files
│   │   ├── modules/           # Core modules
│   │   │   ├── errorCapturer.js    # Error capturing
│   │   │   ├── sourceMapper.js     # Source map handling
│   │   │   ├── elementIdentifier.js # DOM element identification
│   │   │   ├── highlighter.js      # Visual highlighting
│   │   │   ├── settingsManager.js  # Settings management
│   │   │   ├── utils.js            # Utility functions
│   │   ├── background.js      # Background script
│   │   ├── contentScript.js   # Content script
│   │   ├── popup.js           # Popup script
│   │   ├── settings.js        # Settings script
├── test/                      # Tests
├── docs/                      # Documentation
├── webpack.config.js          # Webpack configuration
├── package.json               # Project configuration
```

## Usage

1. **Enable/Disable**: Click the extension icon and use the toggle switch to enable or disable the extension.

2. **View Errors**: When an error occurs, the associated DOM element will be highlighted on the page. Click the extension icon to see a list of all errors.

3. **Error Details**: Click on an error in the list to see detailed information, including the full stack trace.

4. **Navigate to Elements**: Click on the element links in the error details to scroll to and flash the highlighted element on the page.

5. **Clear Errors**: Use the "Clear All" button to remove all error highlights and reset the error list.

6. **Settings**: Click the "Settings" button to access the extension settings, where you can customize the highlight style, domain settings, and more.

## Testing

To test the extension, you can create a simple HTML page with JavaScript errors:

1. Create a test HTML file:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>JavaScript Error Visualizer Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            button {
                padding: 10px 15px;
                margin: 10px;
                background-color: #4a90e2;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            button:hover {
                background-color: #3a7bc8;
            }
            .error-container {
                margin-top: 20px;
                padding: 15px;
                background-color: #f5f5f5;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <h1>JavaScript Error Visualizer Test Page</h1>
        <p>
            This page contains various JavaScript errors to test the JavaScript
            Error Visualizer extension.
        </p>

        <div>
            <button id="runtime-error-btn">Trigger Runtime Error</button>
            <button id="promise-error-btn">Trigger Promise Rejection</button>
            <button id="console-error-btn">Trigger Console Error</button>
        </div>

        <div class="error-container" id="error-container">
            <h2>Error Log:</h2>
            <ul id="error-log"></ul>
        </div>

        <script>
            // Function to log errors to the page
            function logError(type, message) {
                const errorLog = document.getElementById("error-log");
                const errorItem = document.createElement("li");
                errorItem.textContent = `${type}: ${message}`;
                errorLog.appendChild(errorItem);
            }

            // Runtime Error
            document
                .getElementById("runtime-error-btn")
                .addEventListener("click", function () {
                    try {
                        // Intentional error: Accessing property of undefined
                        const obj = undefined;
                        obj.property = "value";
                    } catch (e) {
                        logError("Caught Runtime Error", e.message);
                        // Re-throw to trigger uncaught error
                        throw new Error(
                            "Uncaught runtime error from button click"
                        );
                    }
                });

            // Promise Rejection
            document
                .getElementById("promise-error-btn")
                .addEventListener("click", function () {
                    // Create a promise that will be rejected
                    new Promise((resolve, reject) => {
                        setTimeout(() => {
                            reject(
                                new Error("Promise rejected from button click")
                            );
                        }, 100);
                    }).catch((e) => {
                        logError("Caught Promise Error", e.message);
                        // Re-throw to trigger unhandled rejection
                        throw e;
                    });
                });

            // Console Error
            document
                .getElementById("console-error-btn")
                .addEventListener("click", function () {
                    console.error("Console error from button click");
                    logError(
                        "Console Error",
                        "Console error from button click"
                    );
                });

            // Automatic error on page load (after a delay)
            setTimeout(() => {
                // This will cause a runtime error
                document.getElementById("non-existent-element").style.color =
                    "red";
            }, 2000);
        </script>
    </body>
</html>
```

2. Save this file as `test.html` in your project directory.

3. Open the file in your browser with the extension installed.

4. You should see the extension automatically highlight the button elements when errors occur, and you can click the extension icon to see the error details.

## License

MIT

## Author

Chirag Singhal
