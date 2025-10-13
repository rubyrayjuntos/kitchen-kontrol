import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Edit2, Trash2, Shield, User, Phone, Mail } from 'lucide-react';
import useStore from '../store';

const UsersWidget = () => {
    const { users, fetchUsers, addUser, updateUser, deleteUser } = useStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState('user');
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!editingUser && password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        
        try {
            if (editingUser) {
                await updateUser({ ...editingUser, name, email, phone, permissions });
                setSuccess('User updated successfully!');
            } else {
                await addUser({ name, email, phone, password, permissions });
                setSuccess('User added successfully!');
            }
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setPermissions('user');
            setEditingUser(null);
            setShowForm(false);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            if (err.message) {
                setError(err.message);
            } else if (typeof err === 'string') {
                setError(err);
            } else {
                setError('Failed to save user. Please try again.');
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone || '');
        setPermissions(user.permissions);
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setPermissions('user');
        setShowForm(false);
        setError('');
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
        <section className="neumorphic-raised" style={{ padding: 'var(--spacing-5)' }}>
            <div className="d-flex items-center justify-between mb-4">
                <div className="d-flex items-center gap-2">
                    <Users size={20} className="text-accent" />
                    <h2 className="text-lg font-bold text-neumorphic-embossed">Users</h2>
                </div>
                <button 
                    className="btn btn-primary btn-sm btn-circular"
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Add user"
                >
                    <UserPlus size={16} />
                </button>
            </div>
            
            {error && (
                <div style={{ 
                    padding: 'var(--spacing-2)', 
                    marginBottom: 'var(--spacing-3)',
                    backgroundColor: 'var(--error-light)',
                    borderLeft: '3px solid var(--error)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--error)'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            {success && (
                <div style={{ 
                    padding: 'var(--spacing-2)', 
                    marginBottom: 'var(--spacing-3)',
                    backgroundColor: 'var(--success-light)',
                    borderLeft: '3px solid var(--success)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--success)'
                }}>
                    <strong>Success!</strong> {success}
                </div>
            )}
            
            {showForm && (
                <div className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                    <h3 className="text-base font-semibold mb-3">{editingUser ? 'Edit User' : 'Add User'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Name</label>
                                <input
                                    type="text"
                                    className="neumorphic-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                />
                            </div>
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Email</label>
                                <input
                                    type="email"
                                    className="neumorphic-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                />
                            </div>
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Phone</label>
                                <input
                                    type="text"
                                    className="neumorphic-input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                />
                            </div>
                            {!editingUser && (
                                <div className="form-field">
                                    <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Password</label>
                                    <input
                                        type="password"
                                        className="neumorphic-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                    />
                                </div>
                            )}
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Role</label>
                                <select
                                    className="neumorphic-input"
                                    value={permissions}
                                    onChange={(e) => setPermissions(e.target.value)}
                                    style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="d-flex gap-2" style={{ marginTop: 'var(--spacing-3)' }}>
                            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                {editingUser ? 'Update' : 'Add'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                {users.length === 0 ? (
                    <div className="text-center text-secondary" style={{ padding: 'var(--spacing-4)' }}>
                        <Users size={32} style={{ opacity: 0.3, margin: '0 auto var(--spacing-2)' }} />
                        <p style={{ fontSize: 'var(--font-size-sm)' }}>No users found</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-secondary)' }}>
                                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Name
                                    </th>
                                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Contact
                                    </th>
                                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Role
                                    </th>
                                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr 
                                        key={user.id}
                                        style={{ borderBottom: '1px solid var(--border-secondary)' }}
                                    >
                                        <td style={{ padding: 'var(--spacing-2)' }}>
                                            <div className="d-flex items-center gap-1">
                                                <User size={14} className="text-secondary" />
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-2)', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                                                <div className="d-flex items-center gap-1" style={{ fontSize: 'var(--font-size-xs)' }}>
                                                    <Mail size={12} />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="d-flex items-center gap-1" style={{ fontSize: 'var(--font-size-xs)' }}>
                                                        <Phone size={12} />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-2)' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-1)',
                                                padding: '2px var(--spacing-2)',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 'var(--font-weight-medium)',
                                                backgroundColor: user.permissions === 'admin' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                                                color: user.permissions === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                                            }}>
                                                {user.permissions === 'admin' && <Shield size={12} />}
                                                {user.permissions}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-2)', textAlign: 'right' }}>
                                            <div className="d-flex gap-1 justify-end">
                                                <button 
                                                    onClick={() => handleEdit(user)} 
                                                    className="btn btn-warning btn-sm"
                                                    style={{ padding: 'var(--spacing-1)' }}
                                                    aria-label={`Edit ${user.name}`}
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user.id)} 
                                                    className="btn btn-error btn-sm"
                                                    style={{ padding: 'var(--spacing-1)' }}
                                                    aria-label={`Delete ${user.name}`}
                                                >
                                                    <Trash2 size={12} />
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
        </section>
    );
};

export default UsersWidget;