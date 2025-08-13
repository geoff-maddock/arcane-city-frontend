# Arcane City Frontend

![CI](https://github.com/geoff-maddock/arcane-city-frontend/workflows/CI/badge.svg)
![Test Suite](https://github.com/geoff-maddock/arcane-city-frontend/workflows/Test%20Suite/badge.svg)

This is a frontend for the Arcane City project, which leverages the [Events-Tracker API](https://github.com/geoff-maddock/events-tracker).  

It is built using React, TypeScript and Tailwind.

# Getting Started

To get started, clone the repository and run `npm install` to install the dependencies.  
Copy the `.env.example` file to `.env` and update the variable to point to the Events-Tracker API.
Run `npm run dev` to start the development server.

# Development

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with coverage
npm run test:coverage
```

## Code Quality

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Build the application
npm run build
```

## Continuous Integration

This project uses GitHub Actions to automatically run tests on every pull request and push to the main branch. The workflows include:

- **Test Suite**: Runs all tests in `src/__tests__` and builds the application
- **CI**: Comprehensive testing across multiple Node.js versions with coverage reporting
- **PR Checks**: Special checks for pull requests with automated comments
- **Deploy**: Deploys the application to the production environment when merged to main

All tests must pass before a pull request can be merged.
