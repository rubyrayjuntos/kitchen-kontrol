import React, { useEffect, useState } from 'react';
import useStore from '../store';

const UserManagement = () => {
    const { users, fetchUsers, addUser, updateUser, deleteUser } = useStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            updateUser({ ...editingUser, name, email, role });
        } else {
            addUser({ name, email, password, role });
        }
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        setEditingUser(null);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <form className="bg-white p-6 rounded shadow-md mb-6" onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {!editingUser && (
                    <div className="mb-4">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-700">Role</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    {editingUser ? 'Update User' : 'Add User'}
                </button>
            </form>
            <div>
                <h2 className="text-xl font-bold mb-4">Users</h2>
                <table className="w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="p-2 border-b">Name</th>
                            <th className="p-2 border-b">Email</th>
                            <th className="p-2 border-b">Role</th>
                            <th className="p-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="p-2 border-b">{user.name}</td>
                                <td className="p-2 border-b">{user.email}</td>
                                <td className="p-2 border-b">{user.role}</td>
                                <td className="p-2 border-b">
                                    <button onClick={() => handleEdit(user)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                                    <button onClick={() => deleteUser(user.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;