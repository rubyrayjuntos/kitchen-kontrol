import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Users, Calendar, User, Pencil, Check, BarChart3 } from 'lucide-react';
import { getPhaseProgress } from '../../utils/getPhaseProgress';
import Modal from '../common/Modal';
import useStore from '../../store';
import { getPhaseColor } from '../../utils/getPhaseColor';

const Dashboard = () => {
    // State hooks
    const [isEditingPhases, setIsEditingPhases] = useState(false);
    const [isEditingRoles, setIsEditingRoles] = useState(false);
    const [isEditingAbsences, setIsEditingAbsences] = useState(false);
    const [isAddingPhase, setIsAddingPhase] = useState(false);
    const [newPhaseTitle, setNewPhaseTitle] = useState('');
    const [newPhaseTime, setNewPhaseTime] = useState('');
    const [statusStats, setStatusStats] = useState({
        activePhases: 0,
        completedPhases: 0,
        pendingPhases: 0,
        totalTasks: 0,
        completedTasks: 0
    });

    // Store integration
    const {
        scheduleData,
        roles,
        users,
        userRoles,
        absentees,
        handleApproveAbsence,
        editingPhaseData,
        setEditingPhaseData,
        handleSavePhase,
        addPhase,
        editingRoleData,
        setEditingRoleData,
        handleSaveRole,
        newAbsenceData,
        setNewAbsenceData,
        handleAddNewAbsence,
        handleDeleteAbsence,
        selection,
        setSelection,
        completedTasks,
        handleTaskCompletion
    } = useStore();

    // Calculate stats for the dashboard
    useEffect(() => {
        const stats = {
            activePhases: 0,
            completedPhases: 0,
            pendingPhases: 0,
            totalTasks: Object.keys(completedTasks || {}).length,
            completedTasks: Object.values(completedTasks || {}).filter(Boolean).length
        };
        
        Object.values(scheduleData.phases || {}).forEach(phase => {
            const status = getPhaseColor(phase.status);
            if (status.includes('completed')) stats.completedPhases++;
            else if (status.includes('active')) stats.activePhases++;
            else stats.pendingPhases++;
        });
        
        setStatusStats(stats);
    }, [scheduleData.phases, completedTasks]);

    // Auto-update phase progress every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setStatusStats(prev => ({ ...prev })); // Force re-render to update progress
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // compute phase widths based on start times (minutes) so widths reflect durations
    const phasesWithWidths = useMemo(() => {
        if (!scheduleData.phases) return [];
        try {
            const entries = Object.entries(scheduleData.phases).map(([id, p]) => ({ id, ...p }));
            const parseTime = (t) => {
                const m = (t || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (!m) return 0;
                let hh = parseInt(m[1], 10);
                const mm = parseInt(m[2], 10);
                const ampm = (m[3] || '').toUpperCase();
                if (ampm === 'AM' && hh === 12) hh = 0;
                if (ampm === 'PM' && hh !== 12) hh += 12;
                return hh * 60 + mm;
            };

            const sorted = entries.slice().sort((a, b) => parseTime(a.time) - parseTime(b.time));
            if (sorted.length === 0) return [];
            const starts = sorted.map(s => parseTime(s.time));
            const ends = starts.map((st, i) => (i < starts.length - 1 ? starts[i + 1] - 1 : st + 59));
            const totalSpan = ends[ends.length - 1] - starts[0] + 1;
            return sorted.map((p, i) => {
                const duration = ends[i] - starts[i] + 1;
                const pct = Math.max(4, Math.round((duration / totalSpan) * 100));
                return { ...p, widthPercent: pct };
            });
        } catch (e) {
            return Object.entries(scheduleData.phases).map(([id, p]) => ({ id, ...p, widthPercent: 14 }));
        }
    }, [scheduleData.phases]);

    const handleAddPhase = () => {
        addPhase({ title: newPhaseTitle, time: newPhaseTime });
        setNewPhaseTitle('');
        setNewPhaseTime('');
        setIsAddingPhase(false);
    };

    // Early loading check
    if (!scheduleData.phases || roles.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-wrapper p-6 bg-surface">
            <div className="grid grid-cols-1 gap-6">
                {/* Daily Kitchen Phases Section */}
                <section className="card chiaroscuro-raised p-6">
                    <header className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="text-primary" size={24} />
                            Daily Kitchen Phases
                        </h2>
                        <button 
                            onClick={() => setIsAddingPhase(true)}
                            className="btn btn-ghost btn-sm chiaroscuro-button"
                            aria-label="Add new phase"
                        >
                            <Pencil size={16} />
                        </button>
                    </header>
                    <div className="phase-timeline flex gap-4 overflow-x-auto pb-4">
                        {phasesWithWidths.map((phase) => (
                            <div 
                                key={phase.id}
                                className={`phase-card chiaroscuro-inset min-w-[200px] p-4 rounded-lg ${
                                    phase.status === 'active' ? 'border-l-4 border-primary' : ''
                                }`}
                                onClick={() => setSelection({ type: 'phase', id: phase.id })}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">{phase.title}</h3>
                                    <span className="text-sm text-muted">{phase.time}</span>
                                </div>
                                {phase.status === 'active' && (
                                    <div className="progress-bar chiaroscuro-inset h-2 rounded-full mt-2">
                                        <div 
                                            className="progress-fill chiaroscuro-raised h-full rounded-full bg-primary"
                                            style={{ 
                                                width: `${getPhaseProgress(phase, phasesWithWidths[phasesWithWidths.findIndex(p => p.id === phase.id) + 1])}%` 
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-6">
                    {/* Daily Role Assignments Section */}
                    <section className="card chiaroscuro-raised p-6">
                        <header className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Users className="text-primary" size={24} />
                                Daily Role Assignments
                            </h2>
                        </header>
                        <div className="space-y-4">
                            {Object.values(scheduleData.phases).map((phase) => (
                                phase.roles.map((role) => {
                                    if (!role) return null;
                                    const roleName = role?.name ?? '(Unnamed role)';
                                    const userRole = userRoles.find(ur => ur.role_id === role.id);
                                    const assignedUser = users.find(u => u.id === userRole?.user_id);

                                    return (
                                        <div key={role.id} className="chiaroscuro-inset p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{roleName}</h3>
                                                    <span className="text-sm text-muted">({phase.title})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {assignedUser ? (
                                                        <button
                                                            onClick={() => setSelection({ type: 'user', id: assignedUser.id })}
                                                            className="btn btn-primary btn-sm chiaroscuro-button"
                                                        >
                                                            <User size={14} />
                                                            <span>{assignedUser.name}</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSelection({ type: 'role', id: role.id })}
                                                            className="btn btn-ghost btn-sm chiaroscuro-button text-warning"
                                                        >
                                                            Unassigned
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Absences Section */}
                    <section className="card chiaroscuro-raised p-6">
                        <header className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Calendar className="text-primary" size={24} />
                                Upcoming Absences
                            </h2>
                            <button
                                onClick={() => setIsEditingAbsences(true)}
                                className="btn btn-ghost btn-sm chiaroscuro-button"
                                aria-label="Manage absences"
                            >
                                <Pencil size={16} />
                            </button>
                        </header>
                        <div className="space-y-4">
                            {absentees.length > 0 ? (
                                absentees.map((absence) => {
                                    const user = users.find(u => u.id === absence.user_id);
                                    return (
                                        <div key={absence.id} className="chiaroscuro-inset p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-medium">{user?.name || 'Unknown User'}</h3>
                                                    <p className="text-sm text-muted">{absence.reason}</p>
                                                    <div className="text-xs text-muted mt-1">
                                                        {absence.start_date} to {absence.end_date}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!absence.approved && (
                                                        <button
                                                            onClick={() => handleApproveAbsence(absence.id)}
                                                            className="btn btn-success btn-sm chiaroscuro-button"
                                                        >
                                                            <Check size={14} />
                                                            Approve
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-muted py-4">
                                    No upcoming absences
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Quick Actions Section */}
                <section className="grid grid-cols-4 gap-6">
                    <button onClick={() => window.location.href = '/daily-logs'} className="quick-action-card chiaroscuro-raised p-6 rounded-lg text-center">
                        <div className="icon-circle chiaroscuro-inset mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full">
                            <Clock size={24} className="text-primary" />
                        </div>
                        <h3 className="font-medium">Complete Daily Logs</h3>
                    </button>
                    <button onClick={() => window.location.href = '/reports'} className="quick-action-card chiaroscuro-raised p-6 rounded-lg text-center">
                        <div className="icon-circle chiaroscuro-inset mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full">
                            <BarChart3 size={24} className="text-primary" />
                        </div>
                        <h3 className="font-medium">View Reports</h3>
                    </button>
                    <button onClick={() => window.location.href = '/training'} className="quick-action-card chiaroscuro-raised p-6 rounded-lg text-center">
                        <div className="icon-circle chiaroscuro-inset mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full">
                            <Users size={24} className="text-primary" />
                        </div>
                        <h3 className="font-medium">Access Training</h3>
                    </button>
                    <button onClick={() => window.location.href = '/planograms'} className="quick-action-card chiaroscuro-raised p-6 rounded-lg text-center">
                        <div className="icon-circle chiaroscuro-inset mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full">
                            <Calendar size={24} className="text-primary" />
                        </div>
                        <h3 className="font-medium">Manage Planograms</h3>
                    </button>
                </section>

            {/* Daily Kitchen Phases */}
            <div className="card card-lg">
                <div className="card-header">
                    <div className="d-flex justify-between items-center w-full">
                        <h2 className="card-header-title text-xl font-bold d-flex items-center gap-2">
                            <Clock size={20} />
                            Daily Kitchen Phases
                        </h2>
                        <button 
                            onClick={() => setIsAddingPhase(true)} 
                            className="btn btn-ghost btn-square"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="phase-timeline neumorphic-raised p-4" role="list">
                        {phasesWithWidths.map((phase) => (
                            <div 
                                key={phase.id} 
                                onClick={() => setSelection({ type: 'phase', id: phase.id })} 
                                className={`phase ${getPhaseColor(phase.status)} neumorphic-inset`} 
                                role="listitem" 
                                style={{flex: `0 0 ${phase.widthPercent}%`}}
                            >
                                <div className="phase-content p-3">
                                    <div className="phase-header d-flex justify-between items-center">
                                        <h3 className="phase-title text-lg font-semibold text-neumorphic-embossed">{phase.title}</h3>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setIsEditingPhases(true); 
                                                setEditingPhaseData(phase);
                                            }} 
                                            className="btn btn-ghost btn-sm btn-square" 
                                            aria-label={`Edit ${phase.title}`}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                    <div className="phase-time text-sm text-muted">{phase.time}</div>
                                    {phase.status === 'active' && (
                                        <div className="phase-progress mt-2">
                                            <div className="progress-track neumorphic-inset">
                                                <div 
                                                    className="progress-fill neumorphic-raised" 
                                                    style={{ width: `${getPhaseProgress(phase, phasesWithWidths[phasesWithWidths.findIndex(p => p.id === phase.id) + 1])}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="phase-tooltip">
                                        {phase.time}
                                        {phasesWithWidths[phasesWithWidths.findIndex(p => p.id === phase.id) + 1]?.time && 
                                            ` - ${phasesWithWidths[phasesWithWidths.findIndex(p => p.id === phase.id) + 1].time}`
                                        }
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="demo-grid mt-6">
                {/* Daily Role Assignments */}
                <div className="card card-lg">
                    <div className="card-header">
                        <div className="d-flex justify-between items-center">
                            <h2 className="card-header-title text-xl font-bold d-flex items-center gap-2">
                                <Users size={20} />
                                Daily Role Assignments
                            </h2>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="roles-list space-y-6">
                            {Object.values(scheduleData.phases).map((phase) => (
                                <div key={phase.id} className="phase-roles neumorphic-raised p-4">
                                    <h3 className="text-lg font-semibold text-neumorphic-embossed mb-3">{phase.title}</h3>
                                    <div className="space-y-2">
                                        {phase.roles.map((role) => {
                                            if (!role) return null;
                                            const roleName = role?.name ?? '(Unnamed role)';
                                            const userRole = userRoles.find(ur => ur.role_id === role.id);
                                            const assignedUser = users.find(u => u.id === userRole?.user_id);

                                            return (
                                                <div key={role.id} className="role-item d-flex justify-between items-center p-2 rounded">
                                                    <button
                                                        onClick={() => setSelection({ type: 'role', id: role.id })}
                                                        className="btn btn-ghost text-left"
                                                    >
                                                        {roleName}
                                                    </button>
                                                    <div className="role-actions d-flex items-center gap-2">
                                                        {assignedUser ? (
                                                            <button
                                                                onClick={() => setSelection({ type: 'user', id: assignedUser.id })}
                                                                className="btn btn-sm btn-primary"
                                                            >
                                                                <User size={14} />
                                                                <span>{assignedUser.name}</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-ghost text-warning"
                                                                onClick={() => setSelection({ type: 'role', id: role.id })}
                                                            >
                                                                Unassigned
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingRoles(true);
                                                                setEditingRoleData(role);
                                                            }}
                                                            className="btn btn-ghost btn-sm btn-square"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily Absences */}
                <div className="card card-lg">
                    <div className="card-header">
                        <div className="d-flex justify-between items-center">
                            <h2 className="card-header-title text-xl font-bold d-flex items-center gap-2">
                                <Calendar size={20} />
                                Daily Absences
                            </h2>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="absences-list space-y-4">
                            {absentees.map((absence) => {
                                const user = users.find(u => u.id === absence.user_id);
                                return (
                                    <div key={absence.id} className="absence-item neumorphic-raised p-4">
                                        <div className="d-flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold">{user?.name || 'Unknown User'}</h4>
                                                <p className="text-sm text-muted">{absence.reason}</p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                {!absence.approved && (
                                                    <button
                                                        onClick={() => handleApproveAbsence(absence.id)}
                                                        className="btn btn-sm btn-success"
                                                    >
                                                        <Check size={14} />
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAbsence(absence.id)}
                                                    className="btn btn-sm btn-error"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={selection?.type === 'phase'}
                onClose={() => setSelection(null)}
                title={selection?.id ? `${scheduleData?.phases?.[selection?.id]?.title ?? ''} Tasks` : ''}
            >
                {selection?.type === 'phase' && (
                    <div className="space-y-4">
                        {scheduleData.phases[selection?.id]?.roles.map((role) => (
                            <div key={role.id} className="neumorphic-raised p-4">
                                <h4 className="text-lg font-semibold text-neumorphic-embossed mb-3">{role.name}</h4>
                                <div className="space-y-2">
                                    {role.tasks.map((task) => (
                                        <label key={task.id} className="d-flex items-center gap-2">
                                            <div className="neumorphic-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={completedTasks[task.id] || false}
                                                    onChange={() => handleTaskCompletion(task.id)}
                                                />
                                                <span className="checkbox-box"></span>
                                            </div>
                                            <span className="text-sm">{task.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={selection?.type === 'role'}
                onClose={() => setSelection(null)}
                title={selection?.id ? `${roles.find(r => r.id === selection.id)?.name ?? '(Unnamed role)'} Tasks` : ''}
            >
                {selection?.type === 'role' && (
                    <div className="space-y-3">
                        {(roles.find(r => r.id === selection.id)?.tasks ?? []).map((task) => (
                            <label key={task.id} className="d-flex items-center gap-2">
                                <div className="neumorphic-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={completedTasks[task.id] || false}
                                        onChange={() => handleTaskCompletion(task.id)}
                                    />
                                    <span className="checkbox-box"></span>
                                </div>
                                <span>{task.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={selection?.type === 'user'}
                onClose={() => setSelection(null)}
                title={selection?.id ? `${users.find(u => u.id === selection.id)?.name} - All Daily Tasks` : ''}
            >
                {selection?.type === 'user' && roles.length > 0 && (
                    <div className="space-y-4">
                        {userRoles
                            .filter((ur) => ur.user_id === selection?.id)
                            .map((ur) => {
                                const role = roles.find(r => r.id === ur.role_id);
                                try {
                                    return (
                                        <div key={role.id} className="neumorphic-raised p-4">
                                            <h4 className="text-lg font-semibold text-neumorphic-embossed mb-3">
                                                {role?.name ?? ''}
                                            </h4>
                                            <div className="space-y-2">
                                                {(role?.tasks ?? []).map((task) => (
                                                    <label key={task.id} className="d-flex items-center gap-2">
                                                        <div className="neumorphic-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={completedTasks[task.id] || false}
                                                                onChange={() => handleTaskCompletion(task.id)}
                                                            />
                                                            <span className="checkbox-box"></span>
                                                        </div>
                                                        <span className="text-sm">{task.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                } catch (error) {
                                    console.error('Error rendering user task:', error);
                                    return null;
                                }
                            })}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isEditingPhases}
                onClose={() => {
                    setIsEditingPhases(false);
                    setEditingPhaseData(null);
                }}
                title="Edit Daily Kitchen Phase"
            >
                <div className="space-y-4">
                    {editingPhaseData && (
                        <div className="neumorphic-raised p-4">
                            <div className="form-field">
                                <label className="form-label">Phase Title</label>
                                <input
                                    type="text"
                                    value={editingPhaseData.title}
                                    onChange={(e) => setEditingPhaseData({
                                        ...editingPhaseData,
                                        title: e.target.value
                                    })}
                                    className="neumorphic-input"
                                />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Start Time</label>
                                <input
                                    type="text"
                                    value={editingPhaseData.time}
                                    onChange={(e) => setEditingPhaseData({
                                        ...editingPhaseData,
                                        time: e.target.value
                                    })}
                                    className="neumorphic-input"
                                    placeholder="e.g., 9:00 AM"
                                />
                            </div>
                            <div className="d-flex justify-end mt-4">
                                <button
                                    onClick={handleSavePhase}
                                    className="btn btn-primary"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isAddingPhase}
                onClose={() => setIsAddingPhase(false)}
                title="Add Daily Kitchen Phase"
            >
                <div className="space-y-4">
                    <div className="neumorphic-raised p-4">
                        <div className="form-field">
                            <label className="form-label">Phase Title</label>
                            <input
                                type="text"
                                placeholder="Enter phase title"
                                value={newPhaseTitle}
                                onChange={(e) => setNewPhaseTitle(e.target.value)}
                                className="neumorphic-input"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Start Time</label>
                            <input
                                type="text"
                                placeholder="e.g., 9:00 AM"
                                value={newPhaseTime}
                                onChange={(e) => setNewPhaseTime(e.target.value)}
                                className="neumorphic-input"
                            />
                        </div>
                        <div className="d-flex justify-end mt-4">
                            <button
                                onClick={handleAddPhase}
                                className="btn btn-primary"
                            >
                                Add Phase
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isEditingRoles}
                onClose={() => {
                    setIsEditingRoles(false);
                    setEditingRoleData(null);
                }}
                title="Edit Daily Role Assignment"
            >
                <div className="space-y-4">
                    {editingRoleData && (
                        <div className="neumorphic-raised p-4">
                            <div className="form-field">
                                <label className="form-label">Role Name</label>
                                <input
                                    type="text"
                                    value={editingRoleData.name}
                                    onChange={(e) => setEditingRoleData({
                                        ...editingRoleData,
                                        name: e.target.value
                                    })}
                                    className="neumorphic-input"
                                />
                            </div>
                            <div className="d-flex justify-end mt-4">
                                <button
                                    onClick={handleSaveRole}
                                    className="btn btn-primary"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isEditingAbsences}
                onClose={() => setIsEditingAbsences(false)}
                title="Manage Absences"
            >
                <div className="space-y-6">
                    <div className="neumorphic-raised p-4">
                        <h3 className="text-lg font-semibold text-neumorphic-embossed mb-4">Add New Absence</h3>
                        <div className="form-field">
                            <label className="form-label">Select User</label>
                            <select
                                className="neumorphic-select"
                                value={newAbsenceData.user_id}
                                onChange={(e) => setNewAbsenceData({
                                    ...newAbsenceData,
                                    user_id: e.target.value
                                })}
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                value={newAbsenceData.start_date}
                                onChange={(e) => setNewAbsenceData({
                                    ...newAbsenceData,
                                    start_date: e.target.value
                                })}
                                className="neumorphic-input"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                value={newAbsenceData.end_date}
                                onChange={(e) => setNewAbsenceData({
                                    ...newAbsenceData,
                                    end_date: e.target.value
                                })}
                                className="neumorphic-input"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Reason</label>
                            <input
                                type="text"
                                placeholder="Enter reason for absence"
                                value={newAbsenceData.reason}
                                onChange={(e) => setNewAbsenceData({
                                    ...newAbsenceData,
                                    reason: e.target.value
                                })}
                                className="neumorphic-input"
                            />
                        </div>
                        <div className="d-flex justify-end mt-4">
                            <button
                                onClick={handleAddNewAbsence}
                                className="btn btn-primary"
                            >
                                Add Absence
                            </button>
                        </div>
                    </div>

                    <div className="neumorphic-raised p-4">
                        <h3 className="text-lg font-semibold text-neumorphic-embossed mb-4">Current Absences</h3>
                        <div className="space-y-3">
                            {(absentees ?? []).map((absence) => (
                                <div key={absence.id} className="d-flex justify-between items-center p-3 neumorphic-inset">
                                    <div>
                                        <div className="font-medium">{absence.user_name}</div>
                                        <div className="text-sm text-muted">
                                            {absence.start_date} to {absence.end_date}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAbsence(absence.id)}
                                        className="btn btn-sm btn-error"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;