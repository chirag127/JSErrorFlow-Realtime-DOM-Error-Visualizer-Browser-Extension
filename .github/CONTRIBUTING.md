# Contributing to JSErrorFlow

Thank you for your interest in contributing to JSErrorFlow! This guide outlines how you can help make this project even better.

## Code of Conduct

Please adhere to our [Code of Conduct](.github/CODE_OF_CONDUCT.md) in all your interactions with the project.

## How to Contribute

There are many ways to contribute:

1.  **Reporting Issues:**
    *   If you find a bug or have a suggestion, please [open an issue](.github/ISSUE_TEMPLATE/bug_report.md) following the provided template. Be as detailed as possible.

2.  **Suggesting Enhancements:**
    *   Suggest new features or improvements by [opening an issue](.github/ISSUE_TEMPLATE/feature_request.md).

3.  **Submitting Pull Requests:**
    *   We welcome pull requests. Here's how to submit one:
        1.  **Fork the repository.**
        2.  **Create a branch** for your changes: `git checkout -b feature/your-feature`.
        3.  **Make your changes.**
        4.  **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format:
            *   `feat: [description]` for new features.
            *   `fix: [description]` for bug fixes.
            *   `docs: [description]` for documentation changes.
            *   `style: [description]` for code style changes (formatting, etc.).
            *   `refactor: [description]` for code refactoring.
            *   `test: [description]` for adding or modifying tests.
            *   `chore: [description]` for build process or auxiliary tool changes.
        5.  **Push your branch** to your fork: `git push origin feature/your-feature`.
        6.  **Open a pull request** against the `main` branch.  Use the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) to provide context.
        7.  **Ensure all tests pass** and that the code adheres to our coding standards (see below).

## Development Guidelines

### Tech Stack

*   **Language:** JavaScript
*   **Build Tool:** Vite 7
*   **Linter/Formatter:** Biome (Speed)
*   **Testing:** Vitest (Unit) + Playwright (E2E)

### Coding Standards

*   **Follow SOLID principles.**
*   **Write clean, readable code:** Use descriptive variable names, comments where necessary (explain *why*, not *what*), and keep functions short.
*   **Testing:** Write unit tests for all new features and bug fixes. Aim for high test coverage.
*   **Code Formatting:** The project uses Biome for linting and formatting.  Make sure your code is formatted correctly before submitting a pull request.
*   **Commit Messages:** Use descriptive commit messages following the Conventional Commits format.
*   **No console errors:** The software must run without any errors logged to the console.

## Setting up your development environment

1.  **Clone the repository:** `git clone <your-fork-url>`
2.  **Navigate to the project directory:** `cd JSErrorFlow-RealTime-Visualizer-Browser-Extension`
3.  **Install dependencies:** `npm install`
4.  **Run the development server:** `npm run dev`
5.  **Run tests:** `npm test`
6.  **Build the extension:** `npm run build`

## License

By contributing, you agree that your contributions will be licensed under the [CC BY-NC 4.0](LICENSE) license.

Thank you again for your contributions!
