import React from 'react';
import { User, Pencil, UserCheck } from 'lucide-react';
import useStore from '../store';

const RoleAssignments = () => {
  const { roles, userRoles, users } = useStore();

  // Get user assigned to a role
  const getUserForRole = (roleId) => {
    const assignment = userRoles?.find(ur => ur.role_id === roleId);
    if (!assignment) return null;
    return users?.find(u => u.id === assignment.user_id);
  };

  return (
    <section className="neumorphic-raised" style={{ padding: 'var(--spacing-6)' }}>
      <div className="d-flex items-center justify-between mb-4">
        <div className="d-flex items-center gap-3">
          <UserCheck size={24} className="text-accent" />
          <h2 className="text-2xl font-bold text-neumorphic-embossed">
            Daily Role Assignments
          </h2>
        </div>
        <button className="btn btn-ghost btn-circular" aria-label="Edit all assignments">
          <Pencil size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {(roles && roles.length > 0) ? (
          roles.map((role) => {
            const assignedUser = getUserForRole(role.id);
            return (
              <div 
                key={role.id} 
                className="neumorphic-inset" 
                style={{ 
                  padding: 'var(--spacing-4)', 
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="d-flex items-center justify-between">
                  <div className="d-flex items-center gap-3">
                    <User size={20} className="text-secondary" />
                    <div>
                      <div className="font-semibold text-base">{role.name}</div>
                      {assignedUser ? (
                        <div className="text-sm text-accent">{assignedUser.name}</div>
                      ) : (
                        <div className="text-sm text-secondary italic">Unassigned</div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn btn-ghost btn-sm"
                    aria-label={`Edit assignment for ${role.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
            <User size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-3)' }} />
            <p>No roles configured</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RoleAssignments;