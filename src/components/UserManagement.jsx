import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Edit2, Trash2, Shield, User } from 'lucide-react';
import useStore from '../store';

const UserManagement = () => {
    const { users, fetchUsers, addUser, updateUser, deleteUser } = useStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            if (editingUser) {
                await updateUser({ ...editingUser, name, email, role });
                setSuccess('User updated successfully!');
            } else {
                await addUser({ name, email, password, role });
                setSuccess('User added successfully!');
            }
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
            setEditingUser(null);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'An error occurred');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setPassword('');
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        setError('');
        setSuccess('');
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                setSuccess('User deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="d-flex items-center gap-3 mb-6">
                <Users size={32} className="text-accent" />
                <h1 className="text-3xl font-bold text-neumorphic-embossed">User Management</h1>
            </div>

            {/* Add/Edit User Form */}
            <div className="card-lg neumorphic-raised" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="d-flex items-center gap-3 mb-4">
                    <UserPlus size={24} className="text-accent" />
                    <h2 className="text-xl font-bold text-neumorphic-embossed">
                        {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                </div>

                {error && (
                    <div style={{ 
                        padding: 'var(--spacing-3)', 
                        marginBottom: 'var(--spacing-4)',
                        backgroundColor: 'var(--error-light)',
                        borderLeft: '4px solid var(--error)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--error)'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ 
                        padding: 'var(--spacing-3)', 
                        marginBottom: 'var(--spacing-4)',
                        backgroundColor: 'var(--success-light)',
                        borderLeft: '4px solid var(--success)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--success)'
                    }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="neumorphic-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="neumorphic-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user@example.com"
                        />
                    </div>

                    {!editingUser && (
                        <div className="form-field">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="neumorphic-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Minimum 6 characters"
                                minLength={6}
                            />
                        </div>
                    )}

                    <div className="form-field">
                        <label className="form-label">Role</label>
                        <select
                            className="neumorphic-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="d-flex gap-3">
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                            {editingUser ? 'Update User' : 'Add User'}
                        </button>
                        {editingUser && (
                            <button 
                                type="button" 
                                onClick={handleCancel} 
                                className="btn btn-ghost btn-lg"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="card-lg neumorphic-raised">
                <h2 className="text-xl font-bold text-neumorphic-embossed mb-4">All Users</h2>
                
                {users.length === 0 ? (
                    <div className="text-center text-secondary" style={{ padding: 'var(--spacing-8)' }}>
                        <Users size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-3)' }} />
                        <p>No users found. Add your first user above.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-secondary)' }}>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Name
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Email
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Role
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr 
                                        key={user.id}
                                        style={{ 
                                            borderBottom: '1px solid var(--border-secondary)',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <div className="d-flex items-center gap-2">
                                                <User size={16} className="text-secondary" />
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', color: 'var(--text-secondary)' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-1)',
                                                padding: 'var(--spacing-1) var(--spacing-3)',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: 'var(--font-weight-medium)',
                                                backgroundColor: user.role === 'admin' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                                                color: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                                            }}>
                                                {user.role === 'admin' && <Shield size={14} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>
                                            <div className="d-flex gap-2 justify-end">
                                                <button 
                                                    onClick={() => handleEdit(user)} 
                                                    className="btn btn-warning btn-sm"
                                                    aria-label={`Edit ${user.name}`}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user.id)} 
                                                    className="btn btn-error btn-sm"
                                                    aria-label={`Delete ${user.name}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;