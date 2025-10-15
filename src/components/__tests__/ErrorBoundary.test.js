/**
 * ErrorBoundary Component Tests
 * Tests for error boundary functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Suppress console.error for error boundary tests
const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Simple ErrorBoundary implementation for testing
class ErrorBoundaryTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component that throws an error
const BrokenComponent = () => {
  throw new Error('Test error');
};

// Component that works fine
const WorkingComponent = () => {
  return <div>Working Component</div>;
};

describe('ErrorBoundary Component', () => {
  afterEach(() => {
    consoleError.mockClear();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundaryTest>
        <WorkingComponent />
      </ErrorBoundaryTest>
    );
    expect(screen.getByText('Working Component')).toBeInTheDocument();
  });

  it('should render error message when child throws error', () => {
    render(
      <ErrorBoundaryTest>
        <BrokenComponent />
      </ErrorBoundaryTest>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should display error fallback UI', () => {
    const { container } = render(
      <ErrorBoundaryTest>
        <BrokenComponent />
      </ErrorBoundaryTest>
    );
    const errorUI = container.querySelector('[role="alert"]');
    expect(errorUI).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    render(
      <ErrorBoundaryTest>
        <div>Child 1</div>
        <div>Child 2</div>
      </ErrorBoundaryTest>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should log error to console when catching error', () => {
    render(
      <ErrorBoundaryTest>
        <BrokenComponent />
      </ErrorBoundaryTest>
    );
    expect(consoleError).toHaveBeenCalled();
  });
});

