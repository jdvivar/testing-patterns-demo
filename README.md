# Testing Patterns Demo

A simple React application demonstrating component separation patterns for testing.

## Architecture

This app follows a data/presentation component separation pattern:

- **`App`** - Root component that composes the application
- **`UserDataProvider`** - Data management component responsible for:
  - Fetching data from the [Random User API](https://randomuser.me/api/)
  - Managing loading, error, and data states
  - Filtering logic
- **`UserList`** - Presentation component responsible for:
  - Rendering filtered user data
  - Displaying loading and error states
  - UI presentation only (no data fetching)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API

This app uses the [Random User API](https://randomuser.me/) to fetch mock user data.
