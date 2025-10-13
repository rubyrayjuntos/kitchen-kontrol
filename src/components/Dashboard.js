import React, { useState, useEffect } from 'react';
import { Clock, Pencil } from 'lucide-react';
import { getPhaseProgress } from '../utils/getPhaseProgress';
import Modal from './Modal';
import useStore from '../store';
import { getPhaseColor } from '../utils/getPhaseColor';
import RoleAssignments from './RoleAssignments';
import Absences from './Absences';
import QuickActions from './QuickActions';

const PhaseCard = ({ phase, isActive }) => {
  const progress = getPhaseProgress(phase);
  return (
    <div className={`neumorphic-raised ${isActive ? 'card-accent' : ''}`} style={{ padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-3)' }}>
      <h3 className="text-lg font-semibold mb-2">{phase.title}</h3>
      <div className="text-secondary mb-3">{phase.time}</div>
      <div style={{ 
        height: '8px', 
        background: 'var(--bg-secondary)', 
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'var(--color-accent)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isEditingPhases, setIsEditingPhases] = useState(false);
  const { scheduleData } = useStore();

  useEffect(() => {
    document.title = 'Dashboard - Kitchen Kontrol';
  }, []);

  const renderPhaseTimeline = () => {
    if (!scheduleData.phases || Object.keys(scheduleData.phases).length === 0) {
      return <div className="text-secondary text-center" style={{ padding: 'var(--spacing-4)' }}>No phases scheduled</div>;
    }

    const sortedPhases = Object.entries(scheduleData.phases)
      .map(([id, phase]) => ({ id, ...phase }))
      .sort((a, b) => {
        const timeA = new Date(`2000/01/01 ${a.time}`);
        const timeB = new Date(`2000/01/01 ${b.time}`);
        return timeA - timeB;
      });

    return (
      <div>
        {sortedPhases.map(phase => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isActive={getPhaseColor(phase.status).includes('active')}
          />
        ))}
      </div>
    );
  };





  return (
    <div className="container" style={{ padding: 'var(--spacing-6)' }}>
      {/* Daily Kitchen Phases */}
      <section className="card-lg mb-6">
        <div className="d-flex items-center justify-between mb-4">
          <div className="d-flex items-center gap-3">
            <Clock size={24} className="text-accent" />
            <h2 className="text-3xl font-bold text-neumorphic-embossed">
              Daily Kitchen Phases
            </h2>
          </div>
          <button 
            className="btn btn-ghost btn-circular"
            onClick={() => setIsEditingPhases(true)}
            aria-label="Edit phases"
          >
            <Pencil size={20} />
          </button>
        </div>
        {renderPhaseTimeline()}
      </section>

      {/* Role Assignments and Absences Grid */}
      <div className="demo-grid mb-6">
        <RoleAssignments />
        <Absences />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Modals */}
      {isEditingPhases && (
        <Modal
          title="Edit Phases"
          onClose={() => setIsEditingPhases(false)}
        >
          {/* Modal content */}
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
