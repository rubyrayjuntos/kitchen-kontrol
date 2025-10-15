/**
 * Dashboard Component Tests
 * Tests for the main dashboard view
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../components/Dashboard';

// Mock child components
jest.mock('../../components/DailyKitchenPhasesTimeline', () => {
  return function MockTimeline() {
    return <div data-testid="daily-phases-timeline">Daily Phases Timeline</div>;
  };
});

jest.mock('../../components/DailyRoleAssignmentsWidget', () => {
  return function MockRoleAssignments() {
    return <div data-testid="role-assignments-widget">Role Assignments</div>;
  };
});

jest.mock('../../components/UpcomingAbsencesWidget', () => {
  return function MockAbsences() {
    return <div data-testid="upcoming-absences-widget">Upcoming Absences</div>;
  };
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('daily-phases-timeline')).toBeInTheDocument();
  });

  it('should render the daily phases timeline widget', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('daily-phases-timeline')).toBeInTheDocument();
    expect(screen.getByText('Daily Phases Timeline')).toBeInTheDocument();
  });

  it('should render the role assignments widget', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('role-assignments-widget')).toBeInTheDocument();
    expect(screen.getByText('Role Assignments')).toBeInTheDocument();
  });

  it('should render the upcoming absences widget', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('upcoming-absences-widget')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Absences')).toBeInTheDocument();
  });

  it('should set document title to Dashboard', () => {
    render(<Dashboard />);
    expect(document.title).toBe('Dashboard - Kitchen Kontrol');
  });

  it('should have proper layout structure', () => {
    const { container } = render(<Dashboard />);
    const mainContainer = container.querySelector('.container');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should render all child widgets on initial load', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('daily-phases-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('role-assignments-widget')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming-absences-widget')).toBeInTheDocument();
  });

  it('should have proper spacing and layout', () => {
    const { container } = render(<Dashboard />);
    const gridContainer = container.querySelector('[style*="grid"]');
    expect(gridContainer).toBeInTheDocument();
  });
});
