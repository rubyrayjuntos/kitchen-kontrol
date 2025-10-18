import React from 'react';
import RolesWidget from './RolesWidget';
import TasksWidget from './TasksWidget';
import RolePhaseWidget from './RolePhaseWidget';

const RolesManagementView = () => {
  return (
    <div className="container" style={{ padding: 'var(--spacing-6)', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 className="text-3xl font-bold text-neumorphic-embossed">Roles & Permissions</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>
            Manage role definitions, assign responsibilities, and map roles to kitchen phases.
          </p>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
        <RolesWidget />
        <TasksWidget />
      </section>

      <RolePhaseWidget />
    </div>
  );
};

export default RolesManagementView;
