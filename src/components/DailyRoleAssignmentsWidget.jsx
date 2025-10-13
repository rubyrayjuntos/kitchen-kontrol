import React, { useState } from 'react';
import { Users, ChevronRight, Calendar } from 'lucide-react';
import Modal from './Modal';
import useStore from '../store';

const DailyRoleAssignmentsWidget = () => {
  const { users, rolePhases, scheduleData, tasks } = useStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);

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
    // Get all role assignments for this user
    const userRolePhases = rolePhases.filter(rp => rp.user_id === userId);
    
    if (userRolePhases.length === 0) return null;

    // Group by phase
    const assignmentsByPhase = {};
    
    userRolePhases.forEach(rp => {
      const phase = scheduleData.phases?.[rp.phase_id];
      const phaseName = phase?.title || phase?.name || 'Unknown Phase';
      const roleName = rp.role_name || 'Unknown Role';
      
      if (!assignmentsByPhase[phaseName]) {
        assignmentsByPhase[phaseName] = [];
      }
      assignmentsByPhase[phaseName].push(roleName);
    });

    // Format as "Phase: Role1, Role2"
    return Object.entries(assignmentsByPhase)
      .map(([phase, roles]) => `${phase}: ${roles.join(', ')}`)
      .join(', ');
  };

  // Get user's tasks for today
  const getUserTasks = (userId) => {
    return tasks.filter(task => {
      // Get role phases for this user
      const userRolePhases = rolePhases.filter(rp => rp.user_id === userId);
      const userRoleIds = userRolePhases.map(rp => rp.role_id);
      
      // Check if task belongs to any of user's roles
      return userRoleIds.includes(task.role_id);
    });
  };

  // Get task completion stats
  const getUserTaskStats = (userId) => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter(t => t.completed).length;
    const total = userTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Get users with assignments
  const usersWithAssignments = users
    .map(user => ({
      ...user,
      assignments: getUserRoleAssignments(user.id),
      stats: getUserTaskStats(user.id)
    }))
    .filter(user => user.assignments); // Only show users with assignments

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
      const phase = scheduleData.phases?.[task.phase_id];
      const phaseName = phase?.title || phase?.name || 'Unknown Phase';
      
      if (!tasksByPhase[phaseName]) {
        tasksByPhase[phaseName] = [];
      }
      tasksByPhase[phaseName].push(task);
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
          <div className="d-flex flex-column gap-3">
            {usersWithAssignments.map(user => (
              <div
                key={user.id}
                className="neumorphic-raised"
                style={{
                  padding: 'var(--spacing-4)',
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
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{ fontSize: '1rem' }}>
                        {user.username}
                      </h4>
                      {user.stats.total > 0 && (
                        <div className="text-secondary text-sm">
                          {user.stats.completed} of {user.stats.total} tasks completed ({user.stats.percentage}%)
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
                    lineHeight: '1.5',
                    paddingLeft: '52px' // Align with username
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Roles:</strong> {user.assignments}
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
          title={`${selectedUser.username}'s Tasks for Today`}
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
            <strong>Assigned Roles:</strong> {selectedUser.assignments}
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
                          {task.title}
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
