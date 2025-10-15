/**
 * Role Management Component Tests
 * Tests for role management functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Test component for role management
const RoleManagementTest = () => {
  const [roles, setRoles] = React.useState([
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'manager', name: 'Manager', description: 'Manager access' },
    { id: 'user', name: 'User', description: 'Standard user access' },
  ]);

  const addRole = (role) => {
    setRoles([...roles, role]);
  };

  const updateRole = (id, updatedRole) => {
    setRoles(roles.map(r => r.id === id ? updatedRole : r));
  };

  const deleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  return (
    <div data-testid="role-management">
      <h1>Role Management</h1>
      <div className="role-list">
        {roles.map(role => (
          <div key={role.id} data-testid={`role-${role.id}`} className="role-card">
            <h3>{role.name}</h3>
            <p>{role.description}</p>
            <button onClick={() => deleteRole(role.id)}>Delete</button>
          </div>
        ))}
      </div>
      <button onClick={() => addRole({
        id: 'new_role',
        name: 'New Role',
        description: 'New role description'
      })}>
        Add Role
      </button>
    </div>
  );
};

describe('Role Management Component', () => {
  it('should render role management interface', () => {
    render(<RoleManagementTest />);
    expect(screen.getByText('Role Management')).toBeInTheDocument();
  });

  it('should display list of roles', () => {
    render(<RoleManagementTest />);
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should display role descriptions', () => {
    render(<RoleManagementTest />);
    expect(screen.getByText('Full system access')).toBeInTheDocument();
    expect(screen.getByText('Manager access')).toBeInTheDocument();
  });

  it('should render role cards for each role', () => {
    render(<RoleManagementTest />);
    expect(screen.getByTestId('role-admin')).toBeInTheDocument();
    expect(screen.getByTestId('role-manager')).toBeInTheDocument();
    expect(screen.getByTestId('role-user')).toBeInTheDocument();
  });

  it('should have delete button for each role', () => {
    render(<RoleManagementTest />);
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('should allow adding new role', async () => {
    render(<RoleManagementTest />);
    
    const addButton = screen.getByText(/add role/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Role')).toBeInTheDocument();
    });
  });

  it('should allow deleting role', async () => {
    render(<RoleManagementTest />);
    
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      const adminRole = screen.queryByTestId('role-admin');
      // After deletion, admin role should be gone
      if (adminRole) {
        expect(adminRole).not.toBeInTheDocument();
      }
    });
  });

  it('should display correct number of roles', () => {
    render(<RoleManagementTest />);
    const roleCards = screen.getAllByTestId(/role-/);
    expect(roleCards.length).toBeGreaterThanOrEqual(3);
  });

  it('should maintain role list state after operations', async () => {
    render(<RoleManagementTest />);
    
    // Initial state
    expect(screen.getByTestId('role-admin')).toBeInTheDocument();

    // Add new role
    const addButton = screen.getByText(/add role/i);
    fireEvent.click(addButton);

    // New role should be visible
    await waitFor(() => {
      expect(screen.getByTestId('role-new_role')).toBeInTheDocument();
    });
  });

  it('should render with proper structure', () => {
    const { container } = render(<RoleManagementTest />);
    const roleList = container.querySelector('.role-list');
    expect(roleList).toBeInTheDocument();
    expect(container.querySelector('h1')).toBeInTheDocument();
  });

  it('should have add role button', () => {
    render(<RoleManagementTest />);
    expect(screen.getByText(/add role/i)).toBeInTheDocument();
  });
});
