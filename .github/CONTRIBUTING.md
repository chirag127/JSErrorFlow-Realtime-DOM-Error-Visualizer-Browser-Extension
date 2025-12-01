# 🚀 Contributing to JSErrorFlow

We welcome contributions to `JSErrorFlow-RealTime-Visualizer-Browser-Extension`! As an elite, high-velocity project, we adhere to stringent standards to ensure maintainability, scalability, and zero-defect quality.

## 📜 Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. Please review the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file for details on expected behavior.

## 🛠️ Development Environment Setup

This project uses modern web technologies and follows the **Apex Toolchain** for browser extensions. Ensure you have the following installed:

1.  **Node.js:** LTS version (preferably 20.x or later).
2.  **npm/yarn/pnpm:** A package manager. We recommend `npm`.

Clone the repository:

```bash
git clone https://github.com/your-username/JSErrorFlow-RealTime-Visualizer-Browser-Extension.git
cd JSErrorFlow-RealTime-Visualizer-Browser-Extension
```

Install dependencies:

```bash
npm install
```

## 🏃 Running the Extension Locally

This project uses **WXT** for building browser extensions, enabling easy local development.

**Development Server:**

```bash
npm run dev
```

This command will typically start a local development server and provide instructions on how to load the unpacked extension into your browser (Chrome, Firefox, Edge, etc.). Follow the prompts from WXT.

## 📝 Contribution Workflow

We follow a strict, iterative workflow to maintain project integrity:

1.  **Fork & Clone:** Fork the repository and clone your fork locally.
2.  **Branch:** Create a new branch for your feature or fix. Use a descriptive name, e.g., `feat/add-custom-error-filtering` or `fix/dom-element-highlight-bug`.
3.  **Develop:** Implement your changes. Adhere to the architectural principles outlined in the project's `README.md` and `AGENTS.md`.
4.  **Lint & Format:** Before committing, run the linter and formatter:
    ```bash
    npm run lint -- --fix
    ```
    *(Note: This command assumes `lint` script is configured to run Biome. Adjust if necessary.)*
5.  **Test:** Ensure all tests pass. Running the full test suite locally is highly recommended:
    ```bash
    npm run test
    ```
    *(Note: This command assumes `test` script is configured to run Vitest.)*
6.  **Commit:** Use **Conventional Commits** for your messages:
    *   `feat:` for new features
    *   `fix:` for bug fixes
    *   `docs:` for documentation changes
    *   `style:` for code style (formatting, etc.)
    *   `refactor:` for refactoring code
    *   `perf:` for performance improvements
    *   `test:` for adding/modifying tests
    *   `chore:` for maintenance tasks

    Example: `feat(error-highlighting): Improve DOM element selection accuracy`

7.  **Pull Request (PR):** Submit a PR against the `main` branch of the original repository. Ensure your PR description clearly explains the changes and links to any relevant issues.

## 📈 Testing Strategy

We maintain a **Comprehensive Testing Strategy** with a target of **100% test coverage** for all critical paths. Contribution tests must:

*   **Be Fast:** Run within milliseconds.
*   **Be Isolated:** Avoid external dependencies; use mocks where necessary.
*   **Be Repeatable:** Produce deterministic results.
*   **Cover Scenarios:** Include success, failure, and edge cases.
*   **Zero Console Errors:** Ensure no console errors occur during test execution.

## 🛡️ Security & Best Practices

*   **Input Sanitization:** All user inputs and external data must be rigorously sanitized (OWASP Top 10 2025 compliant).
*   **Zero Trust:** Assume all external interactions are untrusted.
*   **Fail Fast:** Errors should be caught and handled or thrown immediately.
*   **No Sensitive Data in Code:** Never commit API keys, secrets, or sensitive configurations directly into the codebase.

## 🌟 Code Style & Principles

*   **TypeScript Strict Mode:** All TypeScript code must be written with `strict: true` enabled.
*   **Biome:** We use Biome for linting and formatting. Ensure your code is formatted correctly before committing.
*   **SOLID & DRY:** Adhere to SOLID principles and the DRY (Don't Repeat Yourself) principle.
*   **Readability:** Write clear, self-documenting code. Comments are used only to explain the *why*, not the *what*.
*   **CQS:** Methods should be either Commands (action) or Queries (data), not both.

## 🤝 Seeking Help or Discussing Ideas

Before submitting a large PR or starting significant new work, please open an issue to discuss your idea. This helps ensure alignment and prevents wasted effort.

Thank you for contributing to `JSErrorFlow`!