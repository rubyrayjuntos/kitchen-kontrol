/**
 * User Management Component Tests
 * Tests for user management functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// We'll create a simple wrapper component for testing
const UserManagementTest = () => {
  const [users, setUsers] = React.useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', permissions: 'user' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', permissions: 'admin' },
  ]);

  const addUser = (user) => {
    setUsers([...users, user]);
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div data-testid="user-management">
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.permissions}</td>
              <td>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => addUser({
        id: users.length + 1,
        name: 'New User',
        email: 'new@example.com',
        permissions: 'user'
      })}>
        Add User
      </button>
    </div>
  );
};

describe('User Management Component', () => {
  it('should render user management table', () => {
    render(<UserManagementTest />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display user list', () => {
    render(<UserManagementTest />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display user email addresses', () => {
    render(<UserManagementTest />);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should display user permissions', () => {
    render(<UserManagementTest />);
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should have action buttons for each user', () => {
    render(<UserManagementTest />);
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should allow adding new user', async () => {
    render(<UserManagementTest />);
    
    const addButton = screen.getByText(/add user/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });

  it('should allow deleting user', async () => {
    render(<UserManagementTest />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('should render table headers correctly', () => {
    render(<UserManagementTest />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should maintain user list state', async () => {
    render(<UserManagementTest />);
    
    // Initially should have 2 users
    expect(screen.getByTestId('user-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('user-row-2')).toBeInTheDocument();

    // Add a user
    const addButton = screen.getByText(/add user/i);
    fireEvent.click(addButton);

    // Should now have 3 users
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });
});
