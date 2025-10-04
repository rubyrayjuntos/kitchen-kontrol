import React, { useEffect, useState } from 'react';
import useStore from '../store';

const RolesWidget = () => {
    const { roles, fetchRoles, addRole, updateRole, deleteRole, users, fetchUsers, assignRole } = useStore();
    const [name, setName] = useState('');
    const [editingRole, setEditingRole] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');

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
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setName(role.name);
    };

    const handleAssignRole = (roleId) => {
        if (selectedUser) {
            assignRole(selectedUser, roleId);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Roles</h2>
            <form className="mb-6" onSubmit={handleSubmit}>
                <h3 className="text-lg font-bold mb-4">{editingRole ? 'Edit Role' : 'Add Role'}</h3>
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
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4">
                    {editingRole ? 'Update Role' : 'Add Role'}
                </button>
            </form>
            <div>
                <h3 className="text-lg font-bold mb-4">Current Roles</h3>
                <table className="w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="p-2 border-b">Name</th>
                            <th className="p-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(roles).map(role => (
                            <tr key={role.id}>
                                <td className="p-2 border-b">{role.name}</td>
                                <td className="p-2 border-b">
                                    <button onClick={() => handleEdit(role)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                                    <button onClick={() => deleteRole(role.id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Assign Role to User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">User</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700">Role</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            onChange={(e) => handleAssignRole(e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {Object.values(roles).map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolesWidget;