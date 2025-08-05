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

All tests must pass before a pull request can be merged.
# Deployment to Digital Ocean

To deploy the application to Digital Ocean, follow these steps:

1. **Create a Digital Ocean account**: If you don't have one, sign up at [Digital Ocean](https://www.digitalocean.com/).

2. **Install doctl**: Digital Ocean's command-line tool. Follow the instructions [here](https://docs.digitalocean.com/reference/doctl/how-to/install/).

3. **Authenticate doctl**: Run `doctl auth init` and follow the prompts to authenticate.

4. **Create a Digital Ocean App**: You can create an app via the Digital Ocean dashboard or using the `doctl` command-line tool. Make sure to note down the `DIGITALOCEAN_APP_ID`.

5. **Set up environment variables**: Copy the `.env.example` file to `.env` and update the variables, including `DIGITALOCEAN_API_TOKEN` and `DIGITALOCEAN_APP_ID`.

6. **Build and deploy the application**: Run the following command to build and deploy the application:
   ```sh
   npm run deploy:do
   ```

7. **Access your application**: Once the deployment is complete, you can access your application at the specified domain.

For more detailed instructions, refer to the [Digital Ocean App Platform documentation](https://www.digitalocean.com/docs/app-platform/).
