# JSErrorFlow-RealTime-Visualizer-Browser-Extension

[![Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension/ci.yml?branch=main&style=flat-square)](https://github.com/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension?style=flat-square)](https://github.com/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension?style=flat-square)](https://github.com/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension/stargazers)


> Elite browser extension for real-time JavaScript error visualization. Pinpoints and highlights errors on DOM elements, dramatically streamlining frontend debugging and boosting developer productivity with intuitive visual feedback.


. ├── .github
│   └── workflows
│       └── ci.yml
├── LICENSE
├── README.md
├── src
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   └── options.js
└── package.json


## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [AI Agent Directives](#ai-agent-directives)

## Features

- **Real-time Error Visualization:** Highlights JavaScript errors directly on the DOM, providing immediate visual feedback.
- **Error Context:** Displays detailed error messages and stack traces within the browser.
- **DOM Element Pinpointing:** Identifies the exact DOM elements associated with errors.
- **Developer Productivity:** Reduces debugging time and improves overall workflow efficiency.
- **Customizable:** Allows users to configure error display settings and preferences.

## Installation

1.  Clone the repository:

    bash
    git clone https://github.com/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension.git
    
2.  Navigate to the project directory:

    bash
    cd JSErrorFlow-RealTime-Visualizer-Browser-Extension
    
3.  Install dependencies:

    bash
    npm install
    
4.  Build the extension:

    bash
    npm run build
    
5.  Load the unpacked extension in your browser:
    -   In Chrome, go to `chrome://extensions/`.
    -   Enable "Developer mode" in the top right corner.
    -   Click "Load unpacked" and select the `dist` directory.

## Usage

1.  Once installed, the extension will automatically monitor JavaScript errors on any webpage you visit.
2.  Errors will be highlighted directly on the DOM elements causing the issue.
3.  Clicking on a highlighted element will display the error message and stack trace.
4.  You can customize the extension's behavior through the options page.

## Contributing

See [CONTRIBUTING.md](https://github.com/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension/blob/main/.github/CONTRIBUTING.md) for details on how to contribute.

## License

This project is licensed under the [CC BY-NC 4.0 License](https://github.com/chirag127/JSErrorFlow-RealTime-Visualizer-Browser-Extension/blob/main/LICENSE).

<details>
<summary>🤖 AI Agent Directives</summary>

yaml
name: JSErrorFlow-RealTime-Visualizer-Browser-Extension
description: Elite browser extension for real-time JavaScript error visualization. Pinpoints and highlights errors on DOM elements, dramatically streamlining frontend debugging and boosting developer productivity with intuitive visual feedback.

prime_directive: Optimize the extension for performance, security, and user experience. Ensure compatibility with modern web standards and browser updates.

tech_stack:
  - JavaScript (ES6+)
  - Browser Extension API
  - DOM manipulation
  - npm (package manager)

architecture: Modular design with clear separation of concerns between background scripts, content scripts, and options page.

linting: ESLint with recommended and browser-specific rules.

testing:
  unit:
    framework: Jest
    commands: npm test
  e2e:
    framework: Playwright
    commands: npm run test:e2e

ci_cd:
  platform: GitHub Actions
  workflow: .github/workflows/ci.yml

principles:
  - SOLID
  - DRY
  - YAGNI

validation:
  install_dependencies: npm install
  run_linters: npm run lint
  run_unit_tests: npm test
  run_e2e_tests: npm run test:e2e
  build_extension: npm run build


</details>

Star ⭐ this repo
