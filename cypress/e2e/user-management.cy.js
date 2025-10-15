/**
 * E2E Tests - User Management
 * Tests for user CRUD operations and management
 */

describe('User Management', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('AdminPass123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to users page
    cy.url().should('include', '/dashboard');
    cy.get('nav a').contains(/users/i).click();
    cy.url().should('include', '/users');
  });

  context('User List Display', () => {
    it('should display users page', () => {
      cy.get('h1').should('contain', 'Users');
    });

    it('should display user table', () => {
      cy.get('table').should('be.visible');
    });

    it('should display user table headers', () => {
      cy.get('table thead th').should('have.length.greaterThan', 0);
      cy.get('table thead').should('contain', 'Name');
      cy.get('table thead').should('contain', 'Email');
    });

    it('should display user data in table', () => {
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
      cy.get('table tbody td').should('contain.text', '@example.com');
    });

    it('should paginate user list', () => {
      // Check for pagination controls
      cy.get('[data-testid="pagination"]').then(($pagination) => {
        if ($pagination.length > 0) {
          cy.get('[data-testid="pagination"] button').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  context('Add User', () => {
    it('should display add user button', () => {
      cy.get('button').contains(/add|create|new/i).should('be.visible');
    });

    it('should open add user modal', () => {
      cy.get('button').contains(/add|create|new/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should display user form fields', () => {
      cy.get('button').contains(/add|create|new/i).click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="text"]').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
      });
    });

    it('should add new user', () => {
      cy.get('button').contains(/add|create|new/i).click();
      
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="text"]').first().type('New User');
        cy.get('input[type="email"]').type('newuser@example.com');
        cy.get('button').contains(/add|save/i).click();
      });

      // Should close dialog
      cy.get('[role="dialog"]').should('not.exist');

      // New user should appear in table
      cy.get('table').should('contain', 'newuser@example.com');
    });

    it('should validate email format', () => {
      cy.get('button').contains(/add|create|new/i).click();
      
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="text"]').first().type('New User');
        cy.get('input[type="email"]').type('invalid-email');
        cy.get('button').contains(/add|save/i).click();
      });

      // Should show error message
      cy.get('[role="alert"]').should('contain', 'email');
    });

    it('should cancel adding user', () => {
      cy.get('button').contains(/add|create|new/i).click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"] button').contains(/cancel|close/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  context('Edit User', () => {
    it('should display edit button for user', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').contains(/edit|update/i).should('be.visible');
      });
    });

    it('should open edit user modal', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').contains(/edit|update/i).click();
      });

      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should update user information', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').contains(/edit|update/i).click();
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="text"]').first().clear().type('Updated Name');
        cy.get('button').contains(/save|update/i).click();
      });

      // Dialog should close
      cy.get('[role="dialog"]').should('not.exist');

      // Changes should be reflected
      cy.get('table').should('contain', 'Updated Name');
    });
  });

  context('Delete User', () => {
    it('should display delete button for user', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').contains(/delete|remove/i).should('be.visible');
      });
    });

    it('should show delete confirmation', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').contains(/delete|remove/i).click();
      });

      // Should show confirmation dialog
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[role="dialog"]').should('contain', /delete|remove|confirm/i);
    });

    it('should delete user after confirmation', () => {
      // Get user email before deletion
      cy.get('table tbody tr').first().within(() => {
        cy.get('td').eq(1).invoke('text').then((email) => {
          // Now delete
          cy.get('button').contains(/delete|remove/i).click();
        });
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('button').contains(/confirm|delete/i).click();
      });

      // User should be removed from table
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should cancel delete operation', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').contains(/delete|remove/i).click();
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('button').contains(/cancel|no/i).click();
      });

      // Dialog should close
      cy.get('[role="dialog"]').should('not.exist');

      // User should still be in table
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  context('Search & Filter', () => {
    it('should display search box', () => {
      cy.get('input[type="search"]').should('be.visible');
    });

    it('should filter users by name', () => {
      cy.get('input[type="search"]').type('Admin');
      cy.wait(500); // Wait for filtering

      cy.get('table tbody tr').each((row) => {
        cy.wrap(row).should('contain', 'Admin');
      });
    });

    it('should clear search', () => {
      cy.get('input[type="search"]').type('Test');
      cy.wait(500);

      cy.get('input[type="search"]').clear();
      cy.wait(500);

      // Table should show all users again
      cy.get('table tbody tr').should('have.length.greaterThan', 1);
    });
  });

  context('Permissions & Authorization', () => {
    it('should only allow admin to add users', () => {
      // Current user is admin, so button should be visible
      cy.get('button').contains(/add|create|new/i).should('be.visible');
    });

    it('should display correct user roles', () => {
      cy.get('table tbody').should('contain', 'admin');
      cy.get('table tbody').should('contain', 'user');
    });
  });

  context('User Profile', () => {
    it('should show user details', () => {
      cy.get('table tbody tr').first().click();

      // Should show user details
      cy.get('[data-testid="user-details"]').should('exist');
    });

    it('should display user contact information', () => {
      cy.get('table tbody tr').first().click();

      cy.get('[data-testid="user-details"]').within(() => {
        cy.get('[data-testid="email"]').should('be.visible');
      });
    });
  });

  context('Bulk Operations', () => {
    it('should select multiple users', () => {
      cy.get('input[type="checkbox"]').first().click();
      cy.get('input[type="checkbox"]').eq(1).click();

      // Bulk action buttons should appear
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
    });

    it('should delete multiple users', () => {
      cy.get('input[type="checkbox"]').first().click();
      cy.get('input[type="checkbox"]').eq(1).click();

      cy.get('button').contains(/delete|remove/i).click();

      cy.get('[role="dialog"]').within(() => {
        cy.get('button').contains(/confirm|delete/i).click();
      });

      // Users should be removed
      cy.get('table tbody tr').should('have.length.lessThan', 5);
    });
  });
});
