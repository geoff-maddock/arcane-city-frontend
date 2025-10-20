# Manual Testing Guide for Your Entities Page

## Overview
This document describes how to manually test the new "Your Entities" page feature.

## Prerequisites
1. Ensure dependencies are installed: `npm ci` or `npm install`
2. Start the development server: `npm run dev`
3. Have a test account that is logged in
4. Have followed at least a few entities with your test account

## Test Scenarios

### 1. Authentication Required
**Test:** Access the page while not logged in
- Navigate to: `http://localhost:5173/entities/your` (while logged out)
- **Expected:** Should redirect to `/login` with a redirect parameter back to `/entities/your`
- After logging in, should be redirected back to `/entities/your`

### 2. Display Followed Entities
**Test:** View your followed entities
- Log in with a test account
- Follow several entities (if not already following any)
- Navigate to: `http://localhost:5173/entities/your`
- **Expected:**
  - Page title: "Your Entities"
  - Page description: "Entities you follow and are interested in."
  - Should display only entities that you follow
  - Each entity should display with:
    - Entity card with photo (if available)
    - Entity name
    - Entity type icon
    - Tags (if any)
    - Follow/unfollow button

### 3. Empty State
**Test:** View page with no followed entities
- Log in with account that doesn't follow any entities
- Navigate to: `http://localhost:5173/entities/your`
- **Expected:**
  - Should show message: "No followed entities found. Try adjusting your filters or follow some entities."

### 4. Filters Functionality
**Test:** Apply filters to followed entities
- Navigate to: `http://localhost:5173/entities/your`
- Click "Show Filters" button
- **Expected:** Filter panel should expand
- Apply various filters:
  - Filter by entity name
  - Filter by entity type (venue, artist, promoter, etc.)
  - Filter by role
  - Filter by status
  - Filter by tag
  - Filter by date ranges
- **Expected:** Only followed entities matching the filters should be displayed

### 5. Filter Clearing
**Test:** Clear all filters
- Apply multiple filters
- Click "Clear All" button
- **Expected:** All filters should be cleared and all followed entities should be displayed

### 6. Pagination
**Test:** Navigate through pages of entities
- If you have more than 25 followed entities, test pagination
- **Expected:**
  - Pagination controls should appear at top and bottom of results
  - Can change items per page (10, 25, 50, 100)
  - Page numbers should work correctly
  - Clicking page numbers should scroll to top

### 7. Sorting
**Test:** Sort entities
- Use the sort dropdown
- Try sorting by:
  - Name (A-Z, Z-A)
  - Type
  - Status
  - Created date
- **Expected:** Entities should re-sort accordingly

### 8. Create Entity Button
**Test:** Access create entity page
- While logged in, on `/entities/your` page
- Click "Create Entity" button
- **Expected:** Should navigate to `/entity/create`

### 9. Navigation Integration
**Test:** Access page from navigation
- Check if there's a menu item or link to reach `/entities/your`
- **Expected:** Should be able to navigate to the page from the main menu (if implemented)

### 10. Responsive Design
**Test:** View page on different screen sizes
- Test on mobile (320px)
- Test on tablet (768px)
- Test on desktop (1024px+)
- **Expected:** Layout should adapt appropriately at each breakpoint

### 11. SEO Metadata
**Test:** Check page metadata
- Navigate to `/entities/your`
- View page source or use browser dev tools
- **Expected:**
  - Title: "Your Entities • [Site Name]"
  - Meta description: "Entities you follow and are interested in."
  - Open Graph tags should be present

### 12. API Endpoint
**Test:** Verify correct API endpoint is called
- Open browser dev tools Network tab
- Navigate to `/entities/your`
- **Expected:**
  - Should see API call to `/entities/following?page=1&limit=25...`
  - Should NOT call `/entities` endpoint
  - Should include auth headers

### 13. Error Handling
**Test:** Handle API errors gracefully
- Simulate API failure (disconnect network or use dev tools to block requests)
- Navigate to `/entities/your`
- **Expected:**
  - Should show error message: "There was an error loading entities. Please try again later."
  - Should not crash or show blank screen

### 14. Loading State
**Test:** Loading indicator
- Navigate to `/entities/your` (with slow 3G throttling in dev tools)
- **Expected:**
  - Should show loading spinner while fetching data
  - Loading spinner should be centered and visible

## Notes
- All functionality should match the main `/entities` page except for the data source (followed vs all entities)
- The page should be consistent with the existing design system
- All interactions should be smooth and responsive

## Automated Tests
Run the automated tests to verify functionality:
```bash
npm test -- src/__tests__/components/YourEntities.test.tsx --run
```

Expected: All tests should pass.
