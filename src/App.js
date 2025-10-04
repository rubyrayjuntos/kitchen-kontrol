import React, { useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import Dashboard from './components/Dashboard';
import LogsView from './components/LogsView';
import ReportsView from './components/ReportsView';
import TrainingView from './components/TrainingView';
import PlanogramView from './components/PlanogramView';
import useStore from './store';

import ErrorBoundary from './components/ErrorBoundary';

const KitchenKontrol = () => {
  const {
    fetchInitialData,
    currentView,
    loading,
  } = useStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const renderCurrentView = () => {
    if (loading) {
        return <div className="p-6"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'logs':
        return <LogsView />;
      case 'reports':
        return <ReportsView />;
      case 'training':
        return <TrainingView />;
      case 'planograms':
        return <PlanogramView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />
      <ErrorBoundary>
        {renderCurrentView()}
      </ErrorBoundary>
    </div>
  );
};

export default KitchenKontrol;