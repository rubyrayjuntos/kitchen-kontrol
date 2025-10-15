import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, Calendar, FileText } from 'lucide-react';
import Modal from './Modal';
import useStore from '../store';
import { apiRequest } from '../utils/api';

const DailyRoleAssignmentsWidget = () => {
  const { users = [], userRoles = [], rolePhases = [], roles = [], scheduleData = {}, tasks = [], user } = useStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [logAssignments, setLogAssignments] = useState([]);

  // Fetch log assignments for today
  useEffect(() => {
    const fetchLogAssignments = async () => {
      if (!user?.token) return;
      
      try {
        const data = await apiRequest('/api/logs/assignments/me', user.token);
        setLogAssignments(data || []);
      } catch (error) {
        console.error('Error fetching log assignments:', error);
        setLogAssignments([]);
      }
    };

    fetchLogAssignments();
  }, [user?.token]);

  // Get today's date formatted
  const getTodayString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get user's role assignments for today
  const getUserRoleAssignments = (userId) => {
    if (!Array.isArray(userRoles) || !Array.isArray(rolePhases)) return [];

    const roleLookup = new Map(roles.map(role => [role.id, role]));
    const userRoleIds = userRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => ur.role_id);

    if (userRoleIds.length === 0) return [];

    const assignmentsByPhase = new Map();

    rolePhases
      .filter(rp => userRoleIds.includes(rp.role_id))
      .forEach(rp => {
        const phase = scheduleData.phases?.[rp.phase_id];
        const phaseName = phase?.title || phase?.name || 'Unassigned Phase';
        const roleName = roleLookup.get(rp.role_id)?.name || 'Unassigned Role';

        if (!assignmentsByPhase.has(phaseName)) {
          assignmentsByPhase.set(phaseName, []);
        }
        assignmentsByPhase.get(phaseName).push(roleName);
      });

    return Array.from(assignmentsByPhase.entries()).map(([phaseName, roleNames]) => ({
      phase: phaseName,
      roles: roleNames
    }));
  };

  // Get user's tasks for today
  const getUserTasks = (userId) => {
    if (!Array.isArray(tasks) || !Array.isArray(userRoles)) return [];

    const userRoleIds = userRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => ur.role_id);

    if (userRoleIds.length === 0) return [];

    return tasks.filter(task => userRoleIds.includes(task.role_id));
  };

  // Get task completion stats
  const getUserTaskStats = (userId) => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter(t => t.completed).length;
    const total = userTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Get user's log assignment stats
  const getUserLogStats = (userId) => {
    const userLogs = logAssignments.filter(log => log.assigned_to_user === userId);
    const completed = userLogs.filter(log => log.is_completed).length;
    const total = userLogs.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Get users with assignments
  const usersWithAssignments = Array.isArray(users) ? users
    .map(existingUser => ({
      ...existingUser,
      assignments: getUserRoleAssignments(existingUser.id),
      stats: getUserTaskStats(existingUser.id),
      logStats: getUserLogStats(existingUser.id)
    }))
    .filter(mappedUser => Array.isArray(mappedUser.assignments) && mappedUser.assignments.length > 0) : [];

  // Handle view tasks
  const handleViewTasks = (user) => {
    setSelectedUser(user);
    setShowTasksModal(true);
  };

  // Group tasks by phase
  const getTasksByPhase = (userId) => {
    const userTasks = getUserTasks(userId);
    const tasksByPhase = {};

    userTasks.forEach(task => {
      const linkedPhases = rolePhases
        .filter(rp => rp.role_id === task.role_id)
        .map(rp => scheduleData.phases?.[rp.phase_id])
        .filter(Boolean);

      if (linkedPhases.length === 0) {
        if (!tasksByPhase['Unassigned Phase']) {
          tasksByPhase['Unassigned Phase'] = [];
        }
        tasksByPhase['Unassigned Phase'].push(task);
        return;
      }

      linkedPhases.forEach(phase => {
        const phaseName = phase.title || phase.name || 'Unassigned Phase';
        if (!tasksByPhase[phaseName]) {
          tasksByPhase[phaseName] = [];
        }
        tasksByPhase[phaseName].push(task);
      });
    });

    return tasksByPhase;
  };

  return (
    <section className="card-lg" style={{ height: '100%' }}>
      {/* Header */}
      <div className="d-flex items-center justify-between mb-4">
        <div className="d-flex items-center gap-3">
          <Users size={24} className="text-accent" />
          <div>
            <h2 className="text-xl font-bold text-neumorphic-embossed">
              Daily Role Assignments
            </h2>
            <p className="text-secondary text-sm">
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {getTodayString()}
            </p>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="neumorphic-inset" style={{ 
        padding: 'var(--spacing-4)', 
        maxHeight: '400px', 
        overflowY: 'auto',
        background: 'var(--bg-elevated)'
      }}>
        {usersWithAssignments.length === 0 ? (
          <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
            No role assignments for today yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 'var(--spacing-3)',
              gridAutoFlow: 'row',
              alignContent: 'start'
            }}
          >
            {usersWithAssignments.map(user => (
              <div
                key={user.id}
                className="neumorphic-raised"
                style={{
                  padding: 'var(--spacing-4)',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleViewTasks(user)}
              >
                {/* User Info */}
                <div className="d-flex items-center justify-between mb-3">
                  <div className="d-flex items-center gap-3">
                    <div 
                      className="neumorphic-raised" 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-primary)',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        color: 'var(--color-accent)'
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{ fontSize: '1rem' }}>
                        {user.name || 'Unnamed User'}
                      </h4>
                      {user.stats.total > 0 && (
                        <div className="text-secondary text-sm">
                          {user.stats.completed} of {user.stats.total} tasks completed ({user.stats.percentage}%)
                        </div>
                      )}
                      {user.logStats.total > 0 && (
                        <div className="text-sm" style={{ 
                          color: user.logStats.completed === user.logStats.total 
                            ? 'var(--color-success)' 
                            : 'var(--color-warning)'
                        }}>
                          <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {user.logStats.completed}/{user.logStats.total} logs completed
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-secondary" />
                </div>

                {/* Role Assignments */}
                <div 
                  className="text-secondary" 
                  style={{ 
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    paddingLeft: '52px'
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 'var(--spacing-1)' }}>
                    Roles
                  </strong>
                  <div className="d-flex flex-column" style={{ gap: 'var(--spacing-1)' }}>
                    {user.assignments.map(({ phase, roles }) => (
                      <div key={`${user.id}-${phase}`}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{phase}</span>
                        <span>: {roles.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {user.stats.total > 0 && (
                  <div style={{ 
                    marginTop: 'var(--spacing-3)',
                    paddingLeft: '52px'
                  }}>
                    <div style={{
                      height: '6px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${user.stats.percentage}%`,
                        background: 'var(--color-accent)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {/* Log Progress Bar */}
                {user.logStats.total > 0 && (
                  <div style={{ 
                    marginTop: 'var(--spacing-2)',
                    paddingLeft: '52px'
                  }}>
                    <div style={{
                      height: '6px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${user.logStats.percentage}%`,
                        background: user.logStats.completed === user.logStats.total 
                          ? 'var(--color-success)' 
                          : 'var(--color-warning)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Modal */}
      {showTasksModal && selectedUser && (
        <Modal 
          isOpen={showTasksModal}
          onClose={() => {
            setShowTasksModal(false);
            setSelectedUser(null);
          }} 
          title={`${selectedUser.name || 'User'}'s Tasks for Today`}
        >
          <div className="mb-4">
            <div className="badge badge-accent" style={{ marginRight: 'var(--spacing-2)' }}>
              {selectedUser.stats.completed} / {selectedUser.stats.total} completed
            </div>
            <div className="badge badge-ghost">
              {selectedUser.stats.percentage}% complete
            </div>
          </div>

          <div className="text-secondary mb-4" style={{ fontSize: '0.875rem' }}>
            <strong>Assigned Roles:</strong>
            {Array.isArray(selectedUser.assignments) && selectedUser.assignments.length > 0 ? (
              <div className="d-flex flex-column" style={{ gap: '4px', marginTop: '4px' }}>
                {selectedUser.assignments.map(({ phase, roles }) => (
                  <div key={`${phase}-${roles.join('-')}`}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{phase}</span>
                    <span>: {roles.join(', ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span> None</span>
            )}
          </div>

          {(() => {
            const tasksByPhase = getTasksByPhase(selectedUser.id);
            const phaseNames = Object.keys(tasksByPhase);

            if (phaseNames.length === 0) {
              return (
                <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
                  No tasks assigned yet.
                </div>
              );
            }

            return phaseNames.map(phaseName => (
              <div key={phaseName} className="mb-5">
                <h4 className="font-semibold mb-3 text-accent" style={{ fontSize: '1rem' }}>
                  {phaseName}
                </h4>
                <div className="d-flex flex-column gap-2">
                  {tasksByPhase[phaseName].map(task => (
                    <div 
                      key={task.id}
                      className="neumorphic-inset"
                      style={{ 
                        padding: 'var(--spacing-3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-3)'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        style={{ 
                          width: '18px', 
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div 
                          style={{ 
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                          }}
                        >
                          {task.title || task.name}
                        </div>
                        {task.description && (
                          <div className="text-secondary text-sm" style={{ marginTop: '4px' }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                      <div className="text-secondary text-sm">
                        {task.role_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </Modal>
      )}
    </section>
  );
};

export default DailyRoleAssignmentsWidget;
