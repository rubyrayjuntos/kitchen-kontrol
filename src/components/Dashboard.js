import React, { useEffect } from 'react';
import RoleAssignments from './RoleAssignments';
import Absences from './Absences';
import QuickActions from './QuickActions';
import DailyKitchenPhasesTimeline from './DailyKitchenPhasesTimeline';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard - Kitchen Kontrol';
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--spacing-6)' }}>
      {/* Daily Kitchen Phases Timeline */}
      <DailyKitchenPhasesTimeline />

      {/* Role Assignments and Absences Grid */}
      <div className="demo-grid mb-6">
        <RoleAssignments />
        <Absences />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
