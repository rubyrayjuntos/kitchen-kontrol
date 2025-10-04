import React, { useEffect, useState } from 'react';
import useStore from '../store';

const TasksWidget = () => {
    const { tasks, fetchTasks, addTask, updateTask, deleteTask, roles, fetchRoles, assignTask } = useStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchRoles();
    }, [fetchTasks, fetchRoles]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            updateTask({ ...editingTask, name, description });
        } else {
            addTask({ name, description });
        }
        setName('');
        setDescription('');
        setEditingTask(null);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setName(task.name);
        setDescription(task.description);
    };

    const handleAssignTask = (taskId) => {
        if (selectedRole) {
            assignTask(selectedRole, taskId);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Tasks</h2>
            <form className="mb-6" onSubmit={handleSubmit}>
                <h3 className="text-lg font-bold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Description</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4">
                    {editingTask ? 'Update Task' : 'Add Task'}
                </button>
            </form>
            <div>
                <h3 className="text-lg font-bold mb-4">Current Tasks</h3>
                <table className="w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="p-2 border-b">Name</th>
                            <th className="p-2 border-b">Description</th>
                            <th className="p-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td className="p-2 border-b">{task.name}</td>
                                <td className="p-2 border-b">{task.description}</td>
                                <td className="p-2 border-b">
                                    <button onClick={() => handleEdit(task)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Assign Task to Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Role</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700">Task</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            onChange={(e) => handleAssignTask(e.target.value)}
                        >
                            <option value="">Select Task</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>{task.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksWidget;