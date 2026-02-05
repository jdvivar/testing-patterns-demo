# Testing Patterns Demo

A simple React application demonstrating component separation patterns and testing strategies.

## Architecture

This app follows a data/presentation component separation pattern:

- **`App`** - Root component that composes the application
- **`UserDataProvider`** - Data management component responsible for:
  - Fetching data from the [Random User API](https://randomuser.me/api/)
  - Managing loading, error, and data states
  - Passing data to presentation components via props
- **`UserList`** - Presentation component responsible for:
  - Rendering user data
  - Displaying loading and error states
  - UI presentation only (no data fetching or business logic)

This separation makes components easier to test in isolation.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Testing

The project uses [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

### Test Structure

```
src/
├── unit-tests/
│   ├── UserDataProvider.test.jsx  # Tests data fetching logic in isolation
│   └── UserList.test.jsx          # Tests UI rendering with various props
└── integration-tests/
    └── UserFlow.test.jsx          # Tests complete user flows with mocked API
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Testing Patterns Demonstrated

- **Unit Tests**: Test components in isolation by mocking dependencies (child components, fetch API)
- **Integration Tests**: Test user flows from the user's perspective with mocked API responses
- **Meaningful Test Names**: Tests are written as documentation, describing expected behavior

## API

This app uses the [Random User API](https://randomuser.me/) to fetch mock user data.

## Branches

- `main` - Stable version with list view
- `feat/grid-ui` - Feature branch with grid layout and hover popovers (has intentionally failing tests to demonstrate test-driven development)
