import React, { useEffect } from 'react';
import useStore from '../store';

const UserTasks = () => {
    const { users, fetchUsers, roles, fetchRoles, tasks, fetchTasks, userRoles, fetchUserRoles } = useStore();

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchTasks();
        fetchUserRoles();
    }, [fetchUsers, fetchRoles, fetchTasks, fetchUserRoles]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">User Tasks</h2>
            <table className="w-full bg-white rounded shadow-md">
                <thead>
                    <tr>
                        <th className="p-2 border-b">User</th>
                        <th className="p-2 border-b">Role</th>
                        <th className="p-2 border-b">Tasks</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        const userRoleIds = userRoles.filter(ur => ur.user_id === user.id).map(ur => ur.role_id);
                        const userRoleNames = userRoleIds.map(roleId => roles.find(r => r.id === roleId)?.name).join(', ');
                        const userTasks = tasks.filter(task => userRoleIds.includes(task.role_id));

                        return (
                            <tr key={user.id}>
                                <td className="p-2 border-b">{user.name}</td>
                                <td className="p-2 border-b">{userRoleNames}</td>
                                <td className="p-2 border-b">
                                    <ul className="list-disc list-inside">
                                        {userTasks.map(task => (
                                            <li key={task.id}>{task.name}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserTasks;