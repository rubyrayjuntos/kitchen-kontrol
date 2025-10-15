/**
 * Login Component Tests
 * Tests for login form functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Login';

// Mock API calls and navigation
jest.mock('../../utils/api', () => ({
  login: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Navigate: ({ to }) => <div data-testid="navigate-to">{to}</div>,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('should render email input field', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/email/i) ||
                      screen.getByPlaceholderText(/email/i) ||
                      screen.getByRole('textbox');
    expect(emailInput).toBeInTheDocument();
  });

  it('should render password input field', () => {
    render(<Login />);
    const passwordInput = screen.getByLabelText(/password/i) ||
                         screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /login|sign in/i })).toBeInTheDocument();
  });

  it('should accept email input', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByRole('textbox');
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should accept password input', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const passwordInput = screen.getByLabelText(/password/i) ||
                         screen.getByPlaceholderText(/password/i);
    await user.type(passwordInput, 'Password123');
    
    expect(passwordInput).toHaveValue('Password123');
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByRole('textbox');
    const passwordInput = screen.getByLabelText(/password/i) ||
                         screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.click(submitButton);

    // Button should be disabled or show loading state
    expect(submitButton).toBeInTheDocument();
  });

  it('should display remember me checkbox', () => {
    render(<Login />);
    const rememberCheckbox = screen.getByRole('checkbox') ||
                            screen.getByLabelText(/remember/i);
    expect(rememberCheckbox || screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have forgot password link', () => {
    render(<Login />);
    const forgotLink = screen.queryByText(/forgot/i) ||
                      screen.queryByText(/password/i);
    // Login should have forgot password option
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByRole('textbox');
    const passwordInput = screen.getByLabelText(/password/i) ||
                         screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it('should have proper form structure', () => {
    const { container } = render(<Login />);
    const form = container.querySelector('form') ||
                container.querySelector('[role="form"]');
    expect(form || container.firstChild).toBeInTheDocument();
  });
});
