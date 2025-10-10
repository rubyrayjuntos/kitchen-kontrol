import React, { useEffect, useState } from 'react';
import useStore from '../store';

const UsersWidget = () => {
    const { users, fetchUsers, addUser, updateUser, deleteUser } = useStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState('user');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingUser && password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        if (editingUser) {
            await updateUser({ ...editingUser, name, email, phone, permissions });
        } else {
            await addUser({ name, email, phone, password, permissions });
        }
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setPermissions('user');
        setEditingUser(null);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone);
        setPermissions(user.permissions);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <form className="mb-6" onSubmit={handleSubmit}>
                <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Phone</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    {!editingUser && (
                        <div>
                            <label className="block text-gray-700">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700">Permissions</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={permissions}
                            onChange={(e) => setPermissions(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4">
                    {editingUser ? 'Update User' : 'Add User'}
                </button>
            </form>
            <div>
                <h3 className="text-lg font-bold mb-4">Current Users</h3>
                <table className="w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="p-2 border-b">Name</th>
                            <th className="p-2 border-b">Email</th>
                            <th className="p-2 border-b">Phone</th>
                            <th className="p-2 border-b">Permissions</th>
                            <th className="p-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="p-2 border-b">{user.name}</td>
                                <td className="p-2 border-b">{user.email}</td>
                                <td className="p-2 border-b">{user.phone}</td>
                                <td className="p-2 border-b">{user.permissions}</td>
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

export default UsersWidget;