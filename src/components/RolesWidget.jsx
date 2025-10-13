import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, UserPlus, Shield } from 'lucide-react';
import useStore from '../store';

const RolesWidget = () => {
    const { roles, fetchRoles, addRole, updateRole, deleteRole, users, fetchUsers, assignRole } = useStore();
    const [name, setName] = useState('');
    const [editingRole, setEditingRole] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, [fetchRoles, fetchUsers]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRole) {
            updateRole({ ...editingRole, name });
        } else {
            addRole({ name });
        }
        setName('');
        setEditingRole(null);
        setShowAddForm(false);
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setName(role.name);
        setShowAddForm(true);
    };

    const handleCancel = () => {
        setEditingRole(null);
        setName('');
        setShowAddForm(false);
    };

    const handleAssignRole = () => {
        if (selectedUser && selectedRole) {
            assignRole(selectedUser, selectedRole);
            setSelectedUser('');
            setSelectedRole('');
            setShowAssignForm(false);
        }
    };

    const handleDelete = (roleId) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            deleteRole(roleId);
        }
    };

    return (
        <section className="neumorphic-raised" style={{ padding: 'var(--spacing-5)' }}>
            <div className="d-flex items-center justify-between mb-4">
                <div className="d-flex items-center gap-2">
                    <Briefcase size={20} className="text-accent" />
                    <h2 className="text-lg font-bold text-neumorphic-embossed">Roles</h2>
                </div>
                <button 
                    className="btn btn-primary btn-sm btn-circular"
                    onClick={() => setShowAddForm(!showAddForm)}
                    aria-label="Add role"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Add/Edit Role Form */}
            {showAddForm && (
                <div className="neumorphic-inset" style={{ 
                    padding: 'var(--spacing-4)', 
                    marginBottom: 'var(--spacing-4)', 
                    borderRadius: 'var(--radius-md)' 
                }}>
                    <h3 className="text-base font-semibold mb-3">
                        {editingRole ? 'Edit Role' : 'Add New Role'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Role Name
                            </label>
                            <input
                                type="text"
                                className="neumorphic-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g., Line Cook, Sous Chef"
                                style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                {editingRole ? 'Update' : 'Add Role'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Roles List */}
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                {roles.length === 0 ? (
                    <div className="text-center text-secondary" style={{ padding: 'var(--spacing-4)' }}>
                        <Briefcase size={32} style={{ opacity: 0.3, margin: '0 auto var(--spacing-2)' }} />
                        <p style={{ fontSize: 'var(--font-size-sm)' }}>No roles found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                        {roles.map((role) => (
                            <div 
                                key={role.id}
                                className="neumorphic-inset"
                                style={{
                                    padding: 'var(--spacing-3)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div className="d-flex items-center gap-2">
                                    <Shield size={16} className="text-accent" />
                                    <span className="font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>
                                        {role.name}
                                    </span>
                                </div>
                                <div className="d-flex gap-1">
                                    <button 
                                        onClick={() => handleEdit(role)} 
                                        className="btn btn-warning btn-sm"
                                        style={{ padding: 'var(--spacing-1)' }}
                                        aria-label={`Edit ${role.name}`}
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(role.id)} 
                                        className="btn btn-error btn-sm"
                                        style={{ padding: 'var(--spacing-1)' }}
                                        aria-label={`Delete ${role.name}`}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign Role Section */}
            <div style={{ 
                borderTop: '1px solid var(--border-secondary)', 
                paddingTop: 'var(--spacing-4)' 
            }}>
                <div className="d-flex items-center justify-between mb-3">
                    <div className="d-flex items-center gap-2">
                        <UserPlus size={18} className="text-accent" />
                        <h3 className="text-base font-semibold">Assign Role</h3>
                    </div>
                    <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowAssignForm(!showAssignForm)}
                    >
                        {showAssignForm ? 'Hide' : 'Show'}
                    </button>
                </div>

                {showAssignForm && (
                    <div className="neumorphic-inset" style={{ 
                        padding: 'var(--spacing-3)', 
                        borderRadius: 'var(--radius-md)' 
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>
                                    User
                                </label>
                                <select
                                    className="neumorphic-input"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>
                                    Role
                                </label>
                                <select
                                    className="neumorphic-input"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={handleAssignRole} 
                            className="btn btn-accent btn-sm"
                            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
                            disabled={!selectedUser || !selectedRole}
                        >
                            <UserPlus size={14} style={{ marginRight: 'var(--spacing-1)' }} />
                            Assign Role
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RolesWidget;