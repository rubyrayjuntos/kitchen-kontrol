import React, { useEffect } from 'react';
import DailyKitchenPhasesTimeline from './DailyKitchenPhasesTimeline';
import DailyRoleAssignmentsWidget from './DailyRoleAssignmentsWidget';
import UpcomingAbsencesWidget from './UpcomingAbsencesWidget';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard - Kitchen Kontrol';
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--spacing-6)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Row 1: Daily Kitchen Phases Timeline - Full Width */}
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <DailyKitchenPhasesTimeline />
      </div>

      {/* Row 2: Role Assignments (Left) and Absences (Right) - Half Width Each */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 'var(--spacing-6)',
          marginBottom: 'var(--spacing-6)'
        }}
      >
        <DailyRoleAssignmentsWidget />
        <UpcomingAbsencesWidget />
      </div>
    </div>
  );
};

export default Dashboard;
