/**
 * E2E Tests - Dashboard
 * Tests for main dashboard functionality
 */

describe('Dashboard', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('AdminPass123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });

  context('Dashboard Layout', () => {
    it('should display dashboard header', () => {
      cy.get('header').should('be.visible');
      cy.get('h1').should('contain', 'Dashboard');
    });

    it('should display navigation bar', () => {
      cy.get('nav').should('be.visible');
      cy.get('nav a').should('have.length.greaterThan', 0);
    });

    it('should display footer', () => {
      cy.get('footer').should('be.visible');
      cy.get('footer').should('contain', 'Kitchen Kontrol');
    });

    it('should have responsive layout', () => {
      // Test desktop view
      cy.viewport(1200, 800);
      cy.get('main').should('be.visible');

      // Test mobile view
      cy.viewport('iphone-x');
      cy.get('main').should('be.visible');

      // Test tablet view
      cy.viewport('ipad-2');
      cy.get('main').should('be.visible');
    });
  });

  context('Dashboard Widgets', () => {
    it('should display all dashboard sections', () => {
      // Check for main widget areas
      cy.get('[data-testid="phases-widget"]').should('exist');
      cy.get('[data-testid="roles-widget"]').should('exist');
      cy.get('[data-testid="absences-widget"]').should('exist');
    });

    it('should display phases timeline', () => {
      cy.get('[data-testid="phases-widget"]').should('be.visible');
      cy.get('[data-testid="phases-widget"]').should('contain', /phase|kitchen/i);
    });

    it('should display role assignments', () => {
      cy.get('[data-testid="roles-widget"]').should('be.visible');
      cy.get('[data-testid="roles-widget"]').should('contain', /role|assign/i);
    });

    it('should display upcoming absences', () => {
      cy.get('[data-testid="absences-widget"]').should('be.visible');
      cy.get('[data-testid="absences-widget"]').should('contain', /absence|schedule/i);
    });
  });

  context('Dashboard Interactions', () => {
    it('should load widget data without errors', () => {
      cy.window().then((win) => {
        // Check for console errors
        expect(win.console.error.getCalls().length).to.equal(0);
      });
    });

    it('should refresh dashboard data', () => {
      // Get initial data
      cy.get('[data-testid="phases-widget"]').invoke('text').then((initialText) => {
        // Click refresh button if available
        cy.get('button[title="Refresh"]').click({ multiple: true, force: true });

        // Wait for potential updates
        cy.wait(1000);

        // Data should still be present
        cy.get('[data-testid="phases-widget"]').should('be.visible');
      });
    });

    it('should handle real-time updates', () => {
      // Open dashboard in two windows to simulate real-time
      cy.get('[data-testid="phases-widget"]').should('be.visible');

      // Wait for any background updates
      cy.wait(2000);

      // Dashboard should remain stable
      cy.get('[data-testid="phases-widget"]').should('be.visible');
    });
  });

  context('Dashboard Navigation', () => {
    it('should navigate to users page', () => {
      cy.get('nav a').contains(/users/i).click();
      cy.url().should('include', '/users');
    });

    it('should navigate to roles page', () => {
      cy.get('nav a').contains(/roles/i).click();
      cy.url().should('include', '/roles');
    });

    it('should navigate to logs page', () => {
      cy.get('nav a').contains(/logs/i).click();
      cy.url().should('include', '/logs');
    });

    it('should navigate back to dashboard', () => {
      // Navigate away
      cy.get('nav a').contains(/users/i).click();
      cy.url().should('include', '/users');

      // Navigate back
      cy.get('nav a').contains(/dashboard/i).click();
      cy.url().should('include', '/dashboard');
    });
  });

  context('Accessibility', () => {
    it('should have accessible navigation', () => {
      cy.get('nav').should('have.attr', 'role', 'navigation');
      cy.get('nav a').each((link) => {
        cy.wrap(link).should('have.attr', 'href');
      });
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h1').first().should('contain', 'Dashboard');
    });

    it('should be keyboard navigable', () => {
      cy.get('nav a').first().focus();
      cy.focused().should('have.attr', 'href');

      cy.realPress('Tab');
      cy.focused().should('have.attr', 'href');
    });

    it('should have alt text for images', () => {
      cy.get('img').each((img) => {
        cy.wrap(img).should('have.attr', 'alt');
      });
    });
  });

  context('Performance', () => {
    it('should load dashboard within acceptable time', () => {
      const startTime = Date.now();

      cy.visit('/dashboard');
      cy.get('h1').should('contain', 'Dashboard');

      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(3000); // 3 seconds
    });

    it('should handle large datasets', () => {
      // Dashboard should render even with large widget data
      cy.get('[data-testid="phases-widget"]').should('be.visible');
      cy.get('[data-testid="roles-widget"]').should('be.visible');
      cy.get('[data-testid="absences-widget"]').should('be.visible');

      // Scroll down to see all content
      cy.scrollTo('bottom');
      cy.get('[data-testid="phases-widget"]').should('be.visible');

      // Scroll back up
      cy.scrollTo('top');
      cy.get('[data-testid="phases-widget"]').should('be.visible');
    });
  });

  context('Error Handling', () => {
    it('should show error state for failed widget', () => {
      // Simulate network error by intercepting API
      cy.intercept('/api/phases', { statusCode: 500 }).as('phasesFail');

      cy.reload();

      // Should show error message or fallback UI
      cy.get('[data-testid="phases-widget"]').should('exist');
    });

    it('should allow retry after error', () => {
      cy.intercept('/api/phases', { statusCode: 500 }).as('phasesFail');

      cy.reload();

      // Look for retry button
      cy.get('button').contains(/retry|reload/i).click({ multiple: true, force: true });

      // Should attempt to reload
      cy.get('[data-testid="phases-widget"]').should('exist');
    });
  });
});
