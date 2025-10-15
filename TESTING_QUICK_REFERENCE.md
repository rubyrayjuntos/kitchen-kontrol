# Testing Quick Reference

## Run All Tests
```bash
npm test
```

## Watch Mode (Auto-run on file changes)
```bash
npm test -- --watch
```

## Test Specific Component
```bash
# Dashboard
npm test -- --testPathPattern="Dashboard"

# UserManagement  
npm test -- --testPathPattern="UserManagement"

# Navigation
npm test -- --testPathPattern="NavigationBar"
```

## Coverage Report
```bash
npm test -- --coverage
```

## Verbose Output
```bash
npm test -- --verbose
```

## Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Summary Commands

### Show Only Passed Tests
```bash
npm test 2>&1 | grep "✓"
```

### Show Only Failed Tests
```bash
npm test 2>&1 | grep "✕"
```

### Count All Tests
```bash
npm test -- --no-coverage 2>&1 | grep "Tests:"
```

## File Structure
```
kitchen-kontrol/
├── __tests__/                    # Backend tests
│   ├── middleware/
│   └── routes/
├── src/
│   ├── components/
│   │   └── __tests__/            # Frontend component tests
│   │       ├── Dashboard.test.js
│   │       ├── ErrorBoundary.test.js
│   │       ├── Modal.test.js
│   │       ├── NavigationBar.test.js
│   │       ├── FormRenderer.test.js
│   │       ├── Login.test.js
│   │       ├── UserManagement.test.js
│   │       └── RoleManagement.test.js
│   ├── __tests__/                # Integration tests
│   │   ├── App.integration.test.js
│   │   └── utils.test.js
│   └── setupTests.js             # React test setup
├── jest.config.js                # Jest configuration
├── .babelrc                       # Babel JSX configuration
└── .github/workflows/            # GitHub Actions (TODO)
```

## Test Suite Status

### Currently Passing ✅
- Dashboard (8)
- ErrorBoundary (6)
- NavigationBar (8)
- Modal (8)
- FormRenderer (12)
- Login (9)
- UserManagement (8)
- RoleManagement (9)
- App Integration (7)
- Utils (25+)
- Middleware Validation (13)

**Total: 106/106 ✅**

## Key Test Files

### Component Tests
- Each component has a corresponding `.test.js` file
- Located in `src/components/__tests__/`
- Uses React Testing Library for DOM queries
- Tests user interactions with `fireEvent`

### Utility Tests
- Located in `src/__tests__/utils.test.js`
- Tests helper functions with various inputs
- Covers edge cases and error conditions

### Integration Tests
- Located in `src/__tests__/App.integration.test.js`
- Tests overall app structure
- Verifies semantic HTML and accessibility

### Middleware Tests
- Located in `__tests__/middleware/`
- Tests validation schemas
- Tests error handling

## Common Issues & Solutions

### Issue: "Can't find module"
**Solution:** Check import paths are relative and correct

### Issue: "Element not found" 
**Solution:** Use `screen.debug()` to see rendered output

### Issue: "Timeout"
**Solution:** Increase timeout: `jest.setTimeout(10000)`

### Issue: "act() warning"
**Solution:** Wrap state updates in `act()` or use `waitFor()`

## Writing New Tests

### Template
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  it('should do something', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('should handle interaction', async () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('result')).toBeInTheDocument();
  });
});
```

### Testing Checklist
- [ ] Component renders without errors
- [ ] Content displays correctly
- [ ] User interactions work (clicks, input)
- [ ] State updates reflected in DOM
- [ ] Errors handled gracefully
- [ ] Accessibility features verified

## Performance

### Test Execution Time
- Full suite: ~2.5 seconds
- Individual test: <100ms typical
- Watch mode: ~1 second per change

### Optimization Tips
- Use `--testNamePattern` for specific tests
- Run relevant test file only during development
- Use watch mode to avoid full suite reruns

## Documentation

- See `WEEK3_COMPONENT_TESTING_COMPLETE.md` for full details
- Test files contain inline comments
- Each test is self-documenting with clear names

