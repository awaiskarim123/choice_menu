# Running the Home Page Tests

## Quick Start

```bash
# Run all tests
npm test

# Run only the home page tests
npm test page.test.tsx

# Run with coverage report
npm test -- --coverage --collectCoverageFrom='app/page.tsx'

# Run in watch mode (useful during development)
npm test -- --watch page.test.tsx

# Run with verbose output
npm test -- --verbose page.test.tsx
```

## Expected Output

When tests pass successfully, you should see output similar to: