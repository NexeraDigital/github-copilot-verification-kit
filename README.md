# GitHub Copilot Verification Kit

This verification kit provides functional validation tests to ensure GitHub Copilot integrations are working correctly in your environment.

## Available Tests

### GitHub Copilot SDK
Functional validation tests for the GitHub Copilot SDK that verify authentication, API communication, and streaming capabilities.

**Quick Start:**
```bash
cd copilot-sdk/functionalValidation
npm install
npm run verify
```

**📖 Full Documentation:** [docs/copilot-sdk.md](docs/copilot-sdk.md)

The copilot-sdk documentation includes:
- Prerequisites and installation instructions
- Detailed troubleshooting for common issues (especially Windows)
- Expected output and success criteria
- Tips for using GitHub Copilot Chat to help run tests

## Prerequisites

- **Node.js 18+** - Required by the SDK
- **GitHub Copilot Subscription** - Active subscription required
- **Authentication** - Via VS Code GitHub Copilot extension or GitHub CLI

## Contributing

When adding new tests, please:
1. Create a new directory under the repository root (e.g., `new-test-suite/`)
2. Add a detailed markdown file in the `docs/` folder
3. Update this README with a brief description and link to the docs
