import React from 'react';
import { Home, FileText, BookOpen, BarChart3, ClipboardCheck, Clock, LayoutGrid, User, Users, TestTube, CalendarCheck } from 'lucide-react';
import useStore from '../store';
import ThemeChooser from './ThemeChooser';

const NavigationBar = () => {
  const { currentView, setCurrentView, getCurrentTimeString, getCurrentDateString, user } = useStore();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'logs', icon: FileText, label: 'Logs' },
    { id: 'log-admin', icon: CalendarCheck, label: 'Assign Logs', adminOnly: true },
    { id: 'training', icon: BookOpen, label: 'Training' },
    { id: 'reports', icon: BarChart3, label: 'Reports', adminOnly: true },
    { id: 'tasks', icon: ClipboardCheck, label: 'Tasks' },
    { id: 'planograms', icon: LayoutGrid, label: 'Planograms' },
    { id: 'users', icon: Users, label: 'Users', adminOnly: true },
    { id: 'form-test', icon: TestTube, label: 'Form Test', adminOnly: true },
  ].filter(item => !item.adminOnly || user?.permissions === 'admin');

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Clock size={24} className="text-accent" />
        Kitchen Kontrol
      </div>
      
      <div className="navbar-nav">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`nav-link ${currentView === id ? 'active' : ''}`}
            type="button"
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="d-flex items-center gap-4">
        <ThemeChooser />
        
        <div className="neumorphic-inset" style={{ 
          padding: 'var(--spacing-3)', 
          borderRadius: 'var(--radius-md)',
          minWidth: '160px'
        }}>
          <div className="d-flex items-center gap-2 mb-1">
            <Clock size={14} className="text-accent" />
            <span className="text-sm font-semibold">{getCurrentTimeString()}</span>
          </div>
          <div className="text-xs text-secondary">{getCurrentDateString()}</div>
        </div>
        
        {user && (
          <div className="d-flex items-center gap-2">
            <User size={18} className="text-accent" />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
