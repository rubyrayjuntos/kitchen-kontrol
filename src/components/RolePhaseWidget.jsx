import React, { useEffect, useState } from 'react';
import { Link2, Plus, Shield, Clock, XCircle } from 'lucide-react';
import useStore from '../store';

const RolePhaseWidget = () => {
    const { roles, fetchRoles, scheduleData, fetchPhases, rolePhases, fetchRolePhases, assignRoleToPhase, unassignRoleFromPhase } = useStore();
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedPhase, setSelectedPhase] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchRoles();
        fetchPhases();
        fetchRolePhases();
    }, [fetchRoles, fetchPhases, fetchRolePhases]);

    const handleAssign = () => {
        if (selectedRole && selectedPhase) {
            assignRoleToPhase(selectedRole, selectedPhase);
            setSelectedRole('');
            setSelectedPhase('');
            setShowForm(false);
        }
    };

    const handleUnassign = (roleId, phaseId) => {
        if (window.confirm('Are you sure you want to unassign this role from this phase?')) {
            unassignRoleFromPhase(roleId, phaseId);
        }
    };

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role?.name || 'Unknown Role';
    };

    const getPhaseName = (phaseId) => {
        return scheduleData.phases[phaseId]?.title || 'Unknown Phase';
    };

    return (
        <section className="neumorphic-raised" style={{ padding: 'var(--spacing-5)' }}>
            <div className="d-flex items-center justify-between mb-4">
                <div className="d-flex items-center gap-2">
                    <Link2 size={20} className="text-accent" />
                    <h2 className="text-lg font-bold text-neumorphic-embossed">Role-Phase Assignments</h2>
                </div>
                <button 
                    className="btn btn-primary btn-sm btn-circular"
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Assign role to phase"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Assignment Form */}
            {showForm && (
                <div className="neumorphic-inset" style={{ 
                    padding: 'var(--spacing-4)', 
                    marginBottom: 'var(--spacing-4)', 
                    borderRadius: 'var(--radius-md)' 
                }}>
                    <h3 className="text-base font-semibold mb-3">Assign Role to Phase</h3>
                    <div className="form-field">
                        <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>
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
                    <div className="form-field">
                        <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Phase
                        </label>
                        <select
                            className="neumorphic-input"
                            value={selectedPhase}
                            onChange={(e) => setSelectedPhase(e.target.value)}
                            style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2)' }}
                        >
                            <option value="">Select Phase</option>
                            {Object.values(scheduleData.phases).map(phase => (
                                <option key={phase.id} value={phase.id}>{phase.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="d-flex gap-2">
                        <button 
                            onClick={handleAssign} 
                            className="btn btn-accent btn-sm" 
                            style={{ flex: 1 }}
                            disabled={!selectedRole || !selectedPhase}
                        >
                            Assign
                        </button>
                        <button 
                            onClick={() => {
                                setShowForm(false);
                                setSelectedRole('');
                                setSelectedPhase('');
                            }} 
                            className="btn btn-ghost btn-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Assignments List */}
            <div>
                {rolePhases.length === 0 ? (
                    <div className="text-center text-secondary" style={{ padding: 'var(--spacing-4)' }}>
                        <Link2 size={32} style={{ opacity: 0.3, margin: '0 auto var(--spacing-2)' }} />
                        <p style={{ fontSize: 'var(--font-size-sm)' }}>No role-phase assignments found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                        {rolePhases.map(rp => (
                            <div 
                                key={`${rp.role_id}-${rp.phase_id}`}
                                className="neumorphic-inset"
                                style={{
                                    padding: 'var(--spacing-3)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div className="d-flex items-center justify-between">
                                    <div style={{ flex: 1 }}>
                                        <div className="d-flex items-center gap-3">
                                            <div className="d-flex items-center gap-1">
                                                <Shield size={14} className="text-accent" />
                                                <span className="font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                    {getRoleName(rp.role_id)}
                                                </span>
                                            </div>
                                            <div style={{ 
                                                width: '1px', 
                                                height: '16px', 
                                                backgroundColor: 'var(--border-secondary)' 
                                            }} />
                                            <div className="d-flex items-center gap-1">
                                                <Clock size={14} className="text-secondary" />
                                                <span style={{ 
                                                    fontSize: 'var(--font-size-sm)',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    {getPhaseName(rp.phase_id)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleUnassign(rp.role_id, rp.phase_id)} 
                                        className="btn btn-error btn-sm"
                                        style={{ padding: 'var(--spacing-1)' }}
                                        aria-label={`Unassign ${getRoleName(rp.role_id)} from ${getPhaseName(rp.phase_id)}`}
                                    >
                                        <XCircle size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default RolePhaseWidget;