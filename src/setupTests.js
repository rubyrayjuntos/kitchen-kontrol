// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Zustand store for all tests
jest.mock('./store', () => ({
  useStore: jest.fn(() => ({
    currentView: 'dashboard',
    setCurrentView: jest.fn(),
    getCurrentTimeString: jest.fn(() => '10:30 AM'),
    getCurrentDateString: jest.fn(() => 'October 15, 2025'),
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
    logout: jest.fn(),
  })),
}));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress specific console errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('act')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
