# GitHub Actions Configuration

This repository is configured with GitHub Actions to automatically run tests on every pull request.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)
- **Triggers**: Push to main/dev/develop branches, Pull Requests
- **Actions**:
  - Runs tests on Node.js 18.x and 20.x
  - Runs linting (`npm run lint`)
  - Runs TypeScript checking (`npx tsc --noEmit`)
  - Runs all tests (`npm test`)
  - Runs test coverage (`npm run test:coverage`)
  - Builds the application (`npm run build`)
  - Uploads coverage reports to Codecov (optional)

### 2. PR Checks Workflow (`.github/workflows/pr-checks.yml`)
- **Triggers**: Pull Request events (opened, synchronize, reopened, ready_for_review)
- **Actions**:
  - Skips draft PRs
  - Runs comprehensive testing on PR commits
  - Comments on PR with test results and coverage
  - Provides build size information

## Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/geoff-maddock/arcane-city-frontend/workflows/CI/badge.svg)
![PR Checks](https://github.com/geoff-maddock/arcane-city-frontend/workflows/PR%20Checks/badge.svg)
```

## Test Coverage

If you want to set up Codecov for coverage reporting:

1. Go to [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. The workflow will automatically upload coverage reports

## Branch Protection Rules

To enforce that tests must pass before merging, set up branch protection rules:

1. Go to your repository Settings → Branches
2. Add a rule for your main branch
3. Enable "Require status checks to pass before merging"
4. Select the following required checks:
   - `Test`
   - `Build`
   - `Test Pull Request`
   - `Build Pull Request`

## Local Development

All the same checks that run in CI can be run locally:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the application
npm run build
```

## Customization

You can customize the workflows by:

- Modifying the Node.js versions in the matrix
- Adding additional test environments
- Changing the branches that trigger the workflows
- Adding deployment steps for successful builds
- Integrating with other services (Slack notifications, etc.)
