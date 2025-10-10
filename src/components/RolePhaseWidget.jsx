import React, { useEffect, useState } from 'react';
import useStore from '../store';

const RolePhaseWidget = () => {
    const { roles, fetchRoles, scheduleData, fetchPhases, rolePhases, fetchRolePhases, assignRoleToPhase, unassignRoleFromPhase } = useStore();
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedPhase, setSelectedPhase] = useState('');

    useEffect(() => {
        fetchRoles();
        fetchPhases();
        fetchRolePhases();
    }, [fetchRoles, fetchPhases, fetchRolePhases]);

    const handleAssign = () => {
        if (selectedRole && selectedPhase) {
            assignRoleToPhase(selectedRole, selectedPhase);
        }
    };

    const handleUnassign = (roleId, phaseId) => {
        unassignRoleFromPhase(roleId, phaseId);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Assign Roles to Phases</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <label className="block text-gray-700">Phase</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={selectedPhase}
                        onChange={(e) => setSelectedPhase(e.target.value)}
                    >
                        <option value="">Select Phase</option>
                        {Object.values(scheduleData.phases).map(phase => (
                            <option key={phase.id} value={phase.id}>{phase.title}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleAssign} className="w-full bg-blue-500 text-white p-2 rounded mt-4">
                    Assign
                </button>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4">Current Assignments</h3>
                <table className="w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="p-2 border-b">Role</th>
                            <th className="p-2 border-b">Phase</th>
                            <th className="p-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rolePhases.map(rp => (
                            <tr key={`${rp.role_id}-${rp.phase_id}`}>
                                <td className="p-2 border-b">{roles.find(r => r.id === rp.role_id)?.name}</td>
                                <td className="p-2 border-b">{scheduleData.phases[rp.phase_id]?.title}</td>
                                <td className="p-2 border-b">
                                    <button onClick={() => handleUnassign(rp.role_id, rp.phase_id)} className="bg-red-500 text-white p-1 rounded">Unassign</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RolePhaseWidget;