import React from 'react';
import { FileText, BarChart3, BookOpen, LayoutGrid, Zap } from 'lucide-react';
import useStore from '../store';

const QuickActions = () => {
  const { setCurrentView } = useStore();

  const actions = [
    {
      id: 'logs',
      icon: FileText,
      label: 'Complete Daily Logs',
      variant: 'btn-primary',
    },
    {
      id: 'reports',
      icon: BarChart3,
      label: 'View Reports',
      variant: 'btn-success',
    },
    {
      id: 'training',
      icon: BookOpen,
      label: 'Access Training',
      variant: 'btn-accent',
    },
    {
      id: 'planograms',
      icon: LayoutGrid,
      label: 'Manage Planograms',
      variant: 'btn-warning',
    },
  ];

  return (
    <section style={{ marginTop: 'var(--spacing-8)' }}>
      <div className="d-flex items-center gap-3 mb-4">
        <Zap size={24} className="text-accent" />
        <h2 className="text-2xl font-bold text-neumorphic-embossed">
          Quick Actions
        </h2>
      </div>
      <div className="demo-grid">
        {actions.map(({ id, icon: Icon, label, variant }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`btn ${variant} btn-lg`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-6)',
              height: 'auto',
              minHeight: '120px',
            }}
          >
            <Icon size={32} />
            <span className="text-sm font-medium text-center">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;