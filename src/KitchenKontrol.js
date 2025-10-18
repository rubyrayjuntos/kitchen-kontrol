import React, { useEffect } from 'react';
import NavigationBar from './components/common/NavigationBar';
import Dashboard from './components/dashboard/Dashboard';
import LogsView from './components/logs/LogsView';
import LogReportsView from './components/logs/LogReportsView';
import TrainingView from './components/management/TrainingView';
import PlanogramView from './components/management/PlanogramView';
import LogAssignmentWidget from './components/logs/LogAssignmentWidget';
import useStore from './store';

import ErrorBoundary from './components/common/ErrorBoundary';

import Login from './components/auth/Login';
import UserManagement from './components/management/UserManagement';
import MyTasks from './components/tasks/MyTasks';
import FormRendererTest from './components/forms/FormRendererTest';
import RolesManagementView from './components/management/RolesManagementView';

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
        return user.permissions === 'admin' ? <LogReportsView /> : <Dashboard />;
      case 'roles-management':
        return user.permissions === 'admin' ? <RolesManagementView /> : <Dashboard />;
      case 'training':
        return <TrainingView />;
      case 'planograms':
        return <PlanogramView />;
      case 'users':
        return user.permissions === 'admin' ? <UserManagement /> : <Dashboard />;
      case 'my-tasks':
        return <MyTasks />;
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