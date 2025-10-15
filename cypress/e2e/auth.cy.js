/**
 * E2E Tests - Authentication & Login
 * Tests for user authentication flow
 */

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset database and seed test data
    cy.visit('/');
  });

  context('Login Page', () => {
    it('should load login page', () => {
      cy.url().should('include', '/login');
      cy.get('h1').should('contain', 'Login');
    });

    it('should display login form', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show error for invalid email', () => {
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('ValidPass123');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'email');
    });

    it('should show error for weak password', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('weak');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'password');
    });
  });

  context('Successful Login', () => {
    it('should login with valid credentials', () => {
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('AdminPass123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should display user info after login', () => {
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('AdminPass123');
      cy.get('button[type="submit"]').click();
      
      // Check user menu shows username
      cy.get('[data-testid="user-menu"]').should('contain', 'Admin');
    });

    it('should maintain session on page reload', () => {
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('AdminPass123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/dashboard');
      
      // Reload page
      cy.reload();
      
      // Should still be logged in
      cy.url().should('include', '/dashboard');
    });
  });

  context('Logout', () => {
    beforeEach(() => {
      // Login first
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('AdminPass123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should logout successfully', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('button').contains('Logout').click();
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should not access dashboard after logout', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('button').contains('Logout').click();
      
      // Try to access dashboard directly
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  context('Remember Me', () => {
    it('should persist login with remember me', () => {
      cy.get('input[type="email"]').type('admin@example.com');
      cy.get('input[type="password"]').type('AdminPass123');
      cy.get('input[type="checkbox"]').check();
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/dashboard');
      
      // Clear storage
      cy.clearCookies();
      cy.clearLocalStorage();
      
      // Reload page
      cy.reload();
      
      // Should still be logged in with remember me
      cy.url().should('include', '/dashboard');
    });
  });

  context('Password Reset', () => {
    it('should show forgot password link', () => {
      cy.get('a').contains(/forgot|reset/i).should('be.visible');
    });

    it('should navigate to password reset page', () => {
      cy.get('a').contains(/forgot|reset/i).click();
      
      cy.url().should('include', '/forgot-password');
      cy.get('h1').should('contain', /password|reset/i);
    });
  });
});
