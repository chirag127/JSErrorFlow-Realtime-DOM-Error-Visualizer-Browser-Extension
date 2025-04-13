Okay, here is a Product Requirements Document (PRD) for the "JavaScript Error Visualizer" browser extension, designed as a final product, not an MVP, adhering to your specified technical setup and emphasizing modularity.

Product Requirements Document: JavaScript Error Visualizer

Version: 1.0
Date: 2023-10-27
Status: Final

1. Introduction

1.1. Purpose: This document outlines the requirements for the "JavaScript Error Visualizer" browser extension. This extension aims to significantly improve the JavaScript debugging experience for web developers by providing immediate visual feedback directly on the webpage, pinpointing the DOM elements associated with runtime JavaScript errors.

1.2. Problem Statement: Debugging JavaScript errors often involves context-switching between the webpage and the browser's developer console. Developers manually parse stack traces and console messages to identify the origin of an error, which can be time-consuming and unintuitive, especially in complex applications or when dealing with minified code. There's often no direct visual link between a runtime error and the UI element it affects or originates from.

1.3. Proposed Solution: A browser extension that automatically captures JavaScript errors (uncaught exceptions, unhandled promise rejections) occurring on the current page. It analyzes the error information (including stack traces and source maps) to identify the most likely associated DOM element(s) and visually highlights these elements directly on the page. An accompanying panel provides a list of errors and detailed information.

2. Goals

2.1. Primary Goal: Reduce the time and effort required for developers to identify the source and location of frontend JavaScript errors.

2.2. Secondary Goals:

Improve the intuitiveness of the JavaScript debugging process.

Provide immediate, contextual visual feedback for errors within the webpage itself.

Offer a centralized view of page errors complementary to the standard developer console.

Minimize performance impact on the browsed webpage.

3. Target Audience

Web Developers (Frontend, Full-Stack)

Quality Assurance Engineers testing web applications

Technical Support personnel diagnosing web issues

4. Functional Requirements

4.1. Error Capture & Processing:

4.1.1. Comprehensive Capture: The extension MUST capture:

Uncaught runtime exceptions (window.onerror).

Unhandled promise rejections (window.onunhandledrejection).

Errors logged via console.error (configurable, see 4.4.5).

4.1.2. Source Map Integration: The extension MUST attempt to utilize available JavaScript source maps (.map files) to translate stack traces from minified/transpiled code back to the original source code for more accurate element identification and clearer error reporting. It should gracefully handle scenarios where source maps are unavailable or fail to load/parse.

4.1.3. Element Identification Heuristics: The extension MUST employ heuristics to determine the most likely DOM element(s) associated with a captured error. This may involve:

Analyzing stack traces for event listeners attached to specific elements.

Identifying elements referenced in the code lines indicated by the (source-mapped) stack trace.

Considering the element that was the target of an event if the error occurred within an event handler.

Gracefully handle errors not directly attributable to a specific visible DOM element (e.g., errors in background tasks, utility functions). These errors should still be listed in the panel (4.2).

4.1.4. Error Deduplication: The extension SHOULD attempt to deduplicate identical errors occurring multiple times, potentially grouping them or showing a counter, to avoid overwhelming the user interface.

4.2. Visual Highlighting on Webpage:

4.2.1. Highlight Mechanism: When an error is successfully linked to one or more DOM elements, the extension MUST visually highlight these elements directly on the webpage. The default highlight SHOULD be a distinct, noticeable (but not obstructive) dashed red border or overlay.

4.2.2. Highlight Persistence: Highlights MUST remain visible until explicitly cleared by the user (via the extension panel or page reload, depending on settings) or navigated away from.

4.2.3. Multiple Errors on Element: If multiple distinct errors are linked to the same element, the highlight SHOULD indicate this (e.g., slightly thicker border, modified tooltip).

4.2.4. Tooltip Information: Hovering over a highlighted element MUST display a tooltip containing:

The error message (concise version).

The (source-mapped, if available) file name and line number where the error originated.

A count if multiple errors are associated with this element.

A prompt to click for more details (opening/focusing the extension panel).

4.2.5. Highlight Customization: Users MUST be able to customize the highlight style (color, border style - solid/dashed/dotted, potentially background overlay) via the extension settings (4.4.1).

4.3. Extension Panel (Popup/Sidebar):

4.3.1. Error List: The extension MUST provide a panel (accessible via its toolbar icon) listing all captured errors for the current active tab. Each entry MUST display:

Error message summary.

(Source-mapped) file name and line number.

Timestamp of the first occurrence.

A count if the error has occurred multiple times.

An indicator if the error is linked to a visible element.

4.3.2. Error Details: Clicking an error entry in the list MUST display a detailed view containing:

Full error message.

Full (source-mapped, if available) stack trace.

Link(s) to the highlighted element(s) on the page (clicking scrolls the element into view and briefly flashes the highlight).

Potential related console logs captured around the error time (if feasible).

4.3.3. Filtering & Searching: The panel MUST allow users to filter the error list (e.g., by error type, source file) and search by keywords within error messages or stack traces.

4.3.4. Clearing Errors: The panel MUST provide functionality to:

Clear a single selected error.

Clear all errors for the current page.

4.3.5. Activation Toggle: The panel MUST feature a prominent toggle switch to easily enable/disable the extension's error capturing and highlighting functionality globally or for the current site (see 4.4.2).

4.3.6. Settings Access: The panel MUST provide access to the extension's settings page.

4.3.7. Icon Badge: The extension's toolbar icon MUST display a badge indicating the number of new or total errors captured on the current page (configurable, see 4.4.6). The badge should be cleared when the panel is opened.

4.4. Settings & Configuration:

4.4.1. Highlight Style: Provide options to customize highlight color and style (border type, thickness, potentially background overlay with opacity).

4.4.2. Enable/Disable Control: Allow users to:

Globally enable/disable the extension.

Enable/disable the extension on specific domains (allowlist/blocklist functionality). Settings should persist.

4.4.3. Error Clearing Behavior: Option to automatically clear errors on page reload/navigation (default: ON) or persist them until manually cleared (default: OFF).

4.4.4. Ignored Errors: Allow users to specify patterns (e.g., based on error message text, source file URL) for errors that the extension should ignore entirely. Support for regular expressions.

4.4.5. Capture console.error: Option to toggle capturing messages logged via console.error as visual errors (default: OFF, as these are often informational).

4.4.6. Icon Badge Content: Option to configure the icon badge to show the count of total errors or only new errors since the panel was last opened.

4.4.7. Source Map Handling: Advanced options (if needed) related to source map fetching timeouts or retries.

5. Non-Functional Requirements

5.1. Performance:

The extension's background processes and content scripts MUST have minimal impact on browser performance and the responsiveness of the target webpage.

Error capture and processing MUST be efficient.

DOM manipulation for highlighting MUST be optimized to avoid layout thrashing or noticeable delays. Resource usage (CPU, memory) should be monitored and kept low.

5.2. Security:

The extension MUST adhere strictly to Manifest V3 security principles (e.g., limited execution scopes, use of service workers).

Content scripts MUST request the minimum necessary permissions.

No user data, website data, or error information (including source code snippets from stack traces) should be transmitted externally. All processing MUST occur locally within the user's browser.

Settings MUST be stored securely using chrome.storage.local or chrome.storage.sync.

5.3. Compatibility:

The extension MUST be compatible with the latest stable versions of major Chromium-based browsers (Google Chrome, Microsoft Edge) and Mozilla Firefox (requires separate manifest/potential API adjustments).

The extension SHOULD function correctly across a wide variety of websites and web frameworks (React, Angular, Vue, vanilla JS, etc.). Testing on diverse sites is required.

5.4. Reliability:

The extension MUST reliably capture errors as specified.

Highlighting MUST accurately reflect the identified elements.

The extension SHOULD NOT interfere with the normal functioning of the webpage or other browser extensions.

Graceful degradation: If source maps fail or element identification is ambiguous, the extension should still log the error in the panel without causing further issues.

5.5. Usability:

Visual highlights MUST be clear but not overly intrusive to the user's interaction with the page.

The extension panel MUST be intuitive and easy to navigate.

Settings MUST be clearly explained.

5.6. Modularity (Internal Structure):

The codebase MUST be organized into distinct, reusable modules (separate JS files/classes) within the extension/ folder. Suggested modules:

errorCapturer.js: Handles setting up listeners (onerror, onunhandledrejection) and capturing raw error data.

sourceMapper.js: Responsible for fetching and parsing source maps and translating stack traces.

elementIdentifier.js: Contains the logic/heuristics for linking errors to DOM elements based on processed stack traces.

highlighter.js: Manages the creation, display, styling, and removal of visual highlights on the DOM.

panelUI.js: Manages the rendering and interactions within the extension panel (list, details, filtering).

settingsManager.js: Handles loading, saving, and applying user settings via chrome.storage.

background.js (Service Worker): Manages extension state, communication between components (e.g., content scripts and panel), icon badging.

contentScript.js: Injected into pages, communicates with the background script, potentially initiates highlighting via highlighter.js.

6. Technical Specifications

6.1. Frontend: Browser Extension (Manifest V3)

Languages: HTML, CSS, JavaScript (ES6+)

APIs: Standard Web APIs, Chrome Extension APIs (chrome.scripting, chrome.storage, chrome.runtime, chrome.tabs, chrome.action, etc.)

6.2. Backend: No backend is required for the core functionality defined in this PRD. All processing and storage occur client-side within the browser extension.

6.3. Project Structure:

extension/: Contains all code for the browser extension (manifest.json, HTML, CSS, JS modules, assets).

backend/: Not applicable for this PRD.

7. Data Handling & Privacy

7.1. Data Collected: The extension processes JavaScript error messages, stack traces, and related source map information generated by the websites the user visits while the extension is active. It also accesses DOM structure to identify and highlight elements.

7.2. Data Storage: All processed error data is stored temporarily for the current session or cleared according to user settings. User configuration settings are stored locally using chrome.storage.local or chrome.storage.sync.

7.3. Data Transmission: No error data, source code snippets, or website content is transmitted off the user's computer.

7.4. Privacy Policy: A clear privacy policy MUST be provided, stating precisely what data is accessed and how it is processed and stored locally.

8. Release Criteria

All Functional Requirements (Section 4) are implemented and thoroughly tested.

All Non-Functional Requirements (Section 5) are met, particularly performance benchmarks and security audits.

Compatibility testing across target browsers and diverse websites is completed.

No critical or major bugs identified in testing.

User documentation (basic usage guide, settings explanation) is available.

Privacy policy is finalized and accessible.

9. Future Considerations (Beyond V1.0)

Integration with Browser Developer Tools panel.

Support for capturing network request errors visually.

More advanced filtering/grouping options (e.g., grouping by root cause).

Option to temporarily "mute" specific errors directly from the tooltip.

Collaborative features (sharing error sessions - would require a backend and privacy considerations).