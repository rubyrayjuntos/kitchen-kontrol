import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, Edit2, Trash2, ListTodo, Tag } from 'lucide-react';
import useStore from '../store';

const TasksWidget = () => {
    const { tasks, fetchTasks, addTask, updateTask, deleteTask, roles, fetchRoles } = useStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchRoles();
    }, [fetchTasks, fetchRoles]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            updateTask({ ...editingTask, name, description, role_id: selectedRole });
        } else {
            addTask({ name, description, role_id: selectedRole });
        }
        setName('');
        setDescription('');
        setSelectedRole('');
        setEditingTask(null);
        setShowForm(false);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setName(task.name);
        setDescription(task.description);
        setSelectedRole(task.role_id);
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingTask(null);
        setName('');
        setDescription('');
        setSelectedRole('');
        setShowForm(false);
    };

    const handleDelete = (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
        }
    };

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role?.name || 'No Role';
    };

    return (
        <section className="neumorphic-raised" style={{ padding: 'var(--spacing-5)' }}>
            <div className="d-flex items-center justify-between mb-4">
                <div className="d-flex items-center gap-2">
                    <CheckSquare size={20} className="text-accent" />
                    <h2 className="text-lg font-bold text-neumorphic-embossed">Tasks</h2>
                </div>
                <button 
                    className="btn btn-primary btn-sm btn-circular"
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Add task"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Add/Edit Task Form */}
            {showForm && (
                <div className="neumorphic-inset" style={{ 
                    padding: 'var(--spacing-4)', 
                    marginBottom: 'var(--spacing-4)', 
                    borderRadius: 'var(--radius-md)' 
                }}>
                    <h3 className="text-base font-semibold mb-3">
                        {editingTask ? 'Edit Task' : 'Add New Task'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Task Name
                            </label>
                            <input
                                type="text"
                                className="neumorphic-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g., Prep vegetables"
                                style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Description
                            </label>
                            <input
                                type="text"
                                className="neumorphic-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the task"
                                style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Assigned Role
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
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                {editingTask ? 'Update' : 'Add Task'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tasks List */}
            <div>
                {tasks.length === 0 ? (
                    <div className="text-center text-secondary" style={{ padding: 'var(--spacing-4)' }}>
                        <ListTodo size={32} style={{ opacity: 0.3, margin: '0 auto var(--spacing-2)' }} />
                        <p style={{ fontSize: 'var(--font-size-sm)' }}>No tasks found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                        {tasks.map((task) => (
                            <div 
                                key={task.id}
                                className="neumorphic-inset"
                                style={{
                                    padding: 'var(--spacing-3)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div className="d-flex items-start justify-between">
                                    <div style={{ flex: 1 }}>
                                        <div className="d-flex items-center gap-2 mb-1">
                                            <CheckSquare size={16} className="text-accent" />
                                            <span className="font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                {task.name}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p style={{ 
                                                fontSize: 'var(--font-size-xs)', 
                                                color: 'var(--text-secondary)',
                                                marginBottom: 'var(--spacing-1)',
                                                marginLeft: '24px'
                                            }}>
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="d-flex items-center gap-1" style={{ marginLeft: '24px' }}>
                                            <Tag size={12} className="text-secondary" />
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {getRoleName(task.role_id)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-1">
                                        <button 
                                            onClick={() => handleEdit(task)} 
                                            className="btn btn-warning btn-sm"
                                            style={{ padding: 'var(--spacing-1)' }}
                                            aria-label={`Edit ${task.name}`}
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(task.id)} 
                                            className="btn btn-error btn-sm"
                                            style={{ padding: 'var(--spacing-1)' }}
                                            aria-label={`Delete ${task.name}`}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TasksWidget;