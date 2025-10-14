import React, { useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import Dashboard from './components/Dashboard';
import LogsView from './components/LogsView';
import ReportsView from './components/ReportsView';
import TrainingView from './components/TrainingView';
import PlanogramView from './components/PlanogramView';
import LogAssignmentWidget from './components/LogAssignmentWidget';
import useStore from './store';

import ErrorBoundary from './components/ErrorBoundary';

import Login from './components/Login';
import UserManagement from './components/UserManagement';
import MyTasks from './components/MyTasks';
import FormRendererTest from './components/FormRendererTest';

const KitchenKontrol = () => {
  const {
    fetchInitialData,
    currentView,
    loading,
    user,
  } = useStore();

  useEffect(() => {
    if (user) {
        fetchInitialData();
    }
  }, [fetchInitialData, user]);

  if (!user) {
    return <Login />;
  }

  const renderCurrentView = () => {
    if (loading) {
        return <div className="p-6"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'logs':
        return <LogsView />;
      case 'log-admin':
        return user.permissions === 'admin' ? <LogAssignmentWidget /> : <Dashboard />;
      case 'reports':
        return user.permissions === 'admin' ? <ReportsView /> : <Dashboard />;
      case 'training':
        return <TrainingView />;
      case 'planograms':
        return <PlanogramView />;
      case 'users':
        return user.permissions === 'admin' ? <UserManagement /> : <Dashboard />;
      case 'my-tasks':
        return user.permissions === 'user' ? <MyTasks /> : <Dashboard />;
      case 'form-test':
        return <FormRendererTest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <NavigationBar />
      <ErrorBoundary>
        {renderCurrentView()}
      </ErrorBoundary>
    </div>
  );
};

export default KitchenKontrol;