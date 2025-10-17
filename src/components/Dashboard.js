import React, { useEffect } from 'react';
import DailyKitchenPhasesTimeline from './DailyKitchenPhasesTimeline';
import DailyRoleAssignmentsWidget from './DailyRoleAssignmentsWidget';
import UpcomingAbsencesWidget from './UpcomingAbsencesWidget';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard - Kitchen Kontrol';
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-section">
        <DailyKitchenPhasesTimeline />
      </div>

      <div className="dashboard-grid">
        <DailyRoleAssignmentsWidget />
        <UpcomingAbsencesWidget />
      </div>
    </div>
  );
};

export default Dashboard;
