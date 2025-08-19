# Arcane City Frontend - GitHub Copilot Instructions

**Always follow these instructions first and only fallback to additional search or bash commands when the information here is incomplete or found to be in error.**

Arcane City Frontend is a React TypeScript web application that serves as an event management and discovery platform. It integrates with the Events-Tracker API backend and provides features for managing events, venues, artists, series, and user interactions.

## Working Effectively

### Bootstrap and Setup
Always run these commands in order when starting work:

```bash
# Copy environment configuration
cp .env.example .env

# CRITICAL: Add missing VITE_API_URL to .env file
echo "VITE_API_URL=http://test.api" >> .env

# Install dependencies - takes ~20 seconds, NEVER CANCEL
npm ci

# Verify installation with quick checks
npm run lint              # Takes 1-2 seconds
npx tsc --noEmit         # Takes 2-3 seconds, type checking
```

### Development Workflow
Run the development server:

```bash
# Start development server on http://localhost:5173
npm run dev
```

### Testing Commands
**CRITICAL TIMING INFORMATION - NEVER CANCEL:**

```bash
# Run all tests - takes ~10 seconds, NEVER CANCEL, set timeout to 30+ seconds
npm test -- --run

# Run tests with coverage - takes ~12 seconds, NEVER CANCEL, set timeout to 30+ seconds  
npm run test:coverage -- --run

# Run tests in watch mode during development
npm test
```

### Build Commands
**CRITICAL TIMING INFORMATION - NEVER CANCEL:**

```bash
# Production build - takes ~15 seconds, NEVER CANCEL, set timeout to 60+ seconds
npm run build

# Preview production build on http://localhost:4173
npm run preview
```

### Code Quality Commands
Always run these before committing changes:

```bash
# Linting - takes 1-2 seconds
npm run lint

# Type checking - takes 2-3 seconds  
npx tsc --noEmit
```

## Validation Requirements

### Mandatory Validation Steps
After making any changes, ALWAYS run through this complete validation checklist:

1. **Code Quality Validation:**
   ```bash
   npm run lint          # Must pass - takes 1-2 seconds
   npx tsc --noEmit     # Must pass - takes 2-3 seconds
   ```

2. **Test Validation:**
   ```bash
   npm test -- --run    # All 58 tests must pass - takes ~10 seconds, NEVER CANCEL
   ```

3. **Build Validation:**
   ```bash
   npm run build        # Must succeed - takes ~15 seconds, NEVER CANCEL  
   ```

4. **Functional Validation:**
   Start the development server and manually test core functionality:
   ```bash
   npm run dev         # Navigate to http://localhost:5173
   ```
   
   **Required Manual Test Scenarios:**
   - Navigate to the homepage and verify the interface loads with navigation, search, and filtering components
   - Test search functionality by clicking in the search textbox
   - Test filtering interface is accessible with multiple filter options (Event Name, Entity, Type, Tag, Date Range)
   - Navigate between different sections (Event Calendar, Entity Listings, etc.) and verify routing works
   - Test responsive design by resizing browser window to verify mobile layout adaptation
   - Verify dark mode toggle button is present and clickable

### Environment Configuration
- Copy `.env.example` to `.env` before first run
- **CRITICAL:** Add the missing `VITE_API_URL` variable to `.env` file for the application to work properly
- Environment variables control API integration:
  - `VITE_API_URL` - Backend API base URL (required, missing from .env.example)
  - `VITE_API_USERNAME` - API authentication username
  - `VITE_API_PASSWORD` - API authentication password  
  - `VITE_API_KEY` - API key for external service integration

**Example working .env configuration:**
```bash
VITE_API_URL=http://test.api
VITE_API_USERNAME=test-user
VITE_API_PASSWORD=test-pass
VITE_API_KEY=test-key
```

## Repository Structure

### Key Directories
- **`/src/components/`** - React components organized by feature
- **`/src/routes/`** - Route components for different pages
- **`/src/hooks/`** - Custom React hooks for state management
- **`/src/services/`** - API service layer
- **`/src/validation/`** - Form validation schemas and utilities
- **`/src/__tests__/`** - Test files organized by component/feature
- **`/.github/workflows/`** - CI/CD pipelines

### Main Application Structure
- **Entry Point:** `src/main.tsx` renders the root App component
- **Routing:** Uses `@tanstack/react-router` defined in `src/router.ts`
- **State Management:** React Query (`@tanstack/react-query`) for server state
- **Styling:** Tailwind CSS with custom design system in `tailwind.config.js`
- **Components:** Radix UI components with custom styling in `src/components/ui/`

### Testing Infrastructure
- **Test Runner:** Vitest with jsdom environment
- **Testing Libraries:** React Testing Library, Jest DOM matchers
- **Test Setup:** `src/setupTests.ts` configures test environment
- **Test Utilities:** `src/__tests__/test-render.ts` provides testing helpers

## Common Development Tasks

### Adding New Components
1. Create component in appropriate `/src/components/` subdirectory
2. Add corresponding test file in `/src/__tests__/components/`
3. Export from parent directory if needed
4. Always validate with the mandatory validation steps

### Adding New Routes
1. Create route component in `/src/routes/`
2. Add route definition to `/src/router.ts`
3. Update navigation components if needed
4. Test navigation and URL handling

### API Integration
- Services in `/src/services/` handle API communication
- Use React Query hooks in `/src/hooks/` for data fetching
- Authentication handled via `auth.service.ts`

### Form Validation
- Use the custom validation system in `/src/validation/schemas.ts`
- Leverage `useFormValidation` hook for form state management
- Add validation tests for new schemas

## CI/CD Pipeline Information

### GitHub Actions Workflows
The repository has comprehensive CI/CD with these workflows:

1. **CI Workflow (`.github/workflows/ci.yml`)**
   - Runs on Node.js 18.x and 20.x
   - Executes linting, type checking, testing, and building
   - Uploads coverage reports and build artifacts

2. **Test Workflow (`.github/workflows/test.yml`)**
   - Simple test runner for PRs to main branch
   - Runs tests and build validation

3. **Deploy Workflow (`.github/workflows/deploy.yml`)**
   - Deploys to Digital Ocean server on main branch pushes
   - Executes `deploy.sh` script on remote server

### Required Status Checks
All PRs must pass these checks before merging:
- Linting passes
- TypeScript compilation succeeds  
- All tests pass (58 tests)
- Production build succeeds

## Performance Expectations

### Build Times (with 50% safety buffer)
- **npm ci:** ~20 seconds (timeout: 60 seconds)
- **npm run lint:** ~2 seconds (timeout: 30 seconds)
- **npx tsc --noEmit:** ~3 seconds (timeout: 30 seconds)
- **npm test -- --run:** ~10 seconds (timeout: 30 seconds)
- **npm run test:coverage:** ~12 seconds (timeout: 30 seconds)
- **npm run build:** ~15 seconds (timeout: 60 seconds)

### Development Server
- **npm run dev:** Starts immediately, serves on port 5173
- **npm run preview:** Starts immediately, serves on port 4173

## Troubleshooting

### Common Issues
- **Build warnings about chunk size:** Normal for this application, consider code splitting for performance
- **Tests requiring specific setup:** Check `src/setupTests.ts` for mock configurations
- **Environment variables not loading:** Ensure `.env` file exists and contains required variables including `VITE_API_URL`
- **API connection errors in browser console:** Expected when using test API URLs - the interface will still load and be testable
- **"Error loading events" messages:** Normal when backend API is not available - focus on testing UI functionality

### Debug Commands
```bash
# Check package audit
npm audit

# Clear node_modules if needed
rm -rf node_modules package-lock.json && npm ci

# Verbose test output
npm test -- --run --reporter=verbose
```

## Application Features Overview

### Core Functionality
- **Event Management:** Create, edit, view, and manage events
- **Entity System:** Venues, artists, promoters, and other entities
- **Series Management:** Recurring event series
- **Tagging System:** Categorization and filtering via tags
- **User Authentication:** Login, registration, and profile management
- **Calendar Integration:** Visual calendar view of events
- **Search & Filtering:** Advanced search with multiple filter options
- **Image Management:** Photo upload and gallery features
- **Social Features:** Follow entities, attend events

### Key Components
- **EventCardGrid:** Main event listing display
- **EntityTypeIcon:** Entity type identification
- **FilterToggleButton:** Advanced filtering interface
- **MenuBar:** Main navigation
- **TagEntityMultiSelect:** Tag selection interface

## Critical Reminders

- **NEVER CANCEL builds or tests** - they may take 15+ seconds
- **ALWAYS set appropriate timeouts** (30+ seconds for tests, 60+ seconds for builds)
- **ALWAYS run the complete validation checklist** before considering work complete
- **ALWAYS test functionality manually** after code changes
- **ALWAYS check that GitHub Actions will pass** by running the same commands locally