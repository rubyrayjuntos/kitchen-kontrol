const ReportsView = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '2025-09-16', end: '2025-09-22' });
    
    // Sample data for reports
    const weeklyLogStatus = {
      'Equipment Temps': { completed: 5, total: 5, percentage: 100 },
      'Food Temps': { completed: 5, total: 5, percentage: 100 },
      'Cleaning Logs': { completed: 4, total: 5, percentage: 80 },
      'Sanitation Setup': { completed: 5, total: 5, percentage: 100 },
      'Reimbursable Meals': { completed: 3, total: 5, percentage: 60 }
    };

    const reimbursableMealsData = {
      totalBreakfast: 1225,
      totalLunch: 4460,
      breakfastRevenue: 2635.75,
      lunchRevenue: 14495.00,
      totalRevenue: 17130.75,
      dailyBreakdown: [
        { date: '2025-09-16', breakfast: 245, lunch: 892, revenue: 3421.50 },
        { date: '2025-09-17', breakfast: 250, lunch: 898, revenue: 3456.00 },
        { date: '2025-09-18', breakfast: 240, lunch: 885, revenue: 3398.75 },
        { date: '2025-09-19', breakfast: 248, lunch: 890, revenue: 3425.50 },
        { date: '2025-09-20', breakfast: 242, lunch: 895, revenue: 3429.00 }
      ]
    };

    const auditTrails = [
      { date: '2025-09-22', time: '08:30', user: 'John Smith', action: 'Completed Equipment Temps', log: 'equipment-temps' },
      { date: '2025-09-22', time: '10:15', user: 'Maria Garcia', action: 'Updated Food Temps', log: 'food-temps' },
      { date: '2025-09-22', time: '11:45', user: 'Sarah Johnson', action: 'Completed Sanitation Setup', log: 'sanitation-setup' },
      { date: '2025-09-22', time: '13:20', user: 'Carlos Rodriguez', action: 'Updated Reimbursable Meals', log: 'reimbursable-meals' },
      { date: '2025-09-21', time: '14:00', user: 'Ana Martinez', action: 'Completed Zone Cleaning', log: 'cleaning-zones' }
    ];

    const reportCategories = [
      { id: 'weekly-status', name: 'Weekly Log Status', description: 'Completion rates for all required logs' },
      { id: 'reimbursable-meals', name: 'Reimbursable Meals Report', description: 'Daily meal counts and revenue tracking' },
      { id: 'audit-trail', name: 'Audit Trail', description: 'Complete log of all system entries and modifications' },
      { id: 'compliance-summary', name: 'Compliance Summary', description: 'Overview of all compliance requirements' },
      { id: 'staff-performance', name: 'Staff Performance', description: 'Individual staff task completion tracking' }
    ];

    const renderReportContent = () => {
      switch (selectedReport.id) {
        case 'weekly-status':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(weeklyLogStatus).map(([logName, data]) => (
                  <div key={logName} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{logName}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{data.completed}/{data.total}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        data.percentage === 100 ? 'bg-green-100 text-green-800' : 
                        data.percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          data.percentage === 100 ? 'bg-green-600' :
                          data.percentage >= 80 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Missing Logs</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span>Cleaning Logs - Friday</span>
                    <span className="text-red-600 text-sm">1 day overdue</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span>Reimbursable Meals - Monday, Wednesday</span>
                    <span className="text-yellow-600 text-sm">Incomplete data</span>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'reimbursable-meals':
          return (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-800">{reimbursableMealsData.totalBreakfast}</div>
                  <div className="text-sm text-blue-600">Total Breakfast</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-800">{reimbursableMealsData.totalLunch}</div>
                  <div className="text-sm text-green-600">Total Lunch</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-800">{(reimbursableMealsData.totalBreakfast + reimbursableMealsData.totalLunch).toLocaleString()}</div>
                  <div className="text-sm text-purple-600">Total Meals</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-800">${reimbursableMealsData.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-yellow-600">Total Revenue</div>
                </div>
              </div>

              {/* Daily Breakdown Table */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Daily Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Breakfast</th>
                        <th className="text-left p-2">Lunch</th>
                        <th className="text-left p-2">Total Meals</th>
                        <th className="text-left p-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reimbursableMealsData.dailyBreakdown.map((day, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{day.date}</td>
                          <td className="p-2">{day.breakfast}</td>
                          <td className="p-2">{day.lunch}</td>
                          <td className="p-2 font-semibold">{day.breakfast + day.lunch}</td>
                          <td className="p-2 font-semibold">${day.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue Calculation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Revenue Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Breakfast: {reimbursableMealsData.totalBreakfast} meals × $2.15</span>
                    <span className="font-semibold">${reimbursableMealsData.breakfastRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lunch: {reimbursableMealsData.totalLunch} meals × $3.25</span>
                    <span className="font-semibold">${reimbursableMealsData.lunchRevenue.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total Revenue</span>
                    <span>${reimbursableMealsData.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'audit-trail':
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="border rounded p-2"
                  />
                </div>
                <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Filter
                </button>
                <button className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Export CSV
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-4">Recent Activity</h4>
                <div className="space-y-2">
                  {auditTrails.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <div className="font-medium">{entry.action}</div>
                        <div className="text-sm text-gray-600">by {entry.user}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{entry.date}</div>
                        <div className="text-sm text-gray-600">{entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'compliance-summary':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Compliant Items</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Equipment temperature logs - 100% complete</li>
                    <li>✓ Food temperature monitoring - On schedule</li>
                    <li>✓ Sanitation setup verified daily</li>
                    <li>✓ Staff training up to date</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Action Required</h4>
                  <ul className="space-y-1 text-sm">
                    <li>! Cleaning logs - 1 missing entry</li>
                    <li>! Reimbursable meals - Data incomplete</li>
                    <li>! Zone 3 cleaning - Needs manager verification</li>
                  </ul>
                </div>
              </div>
            </div>
          );

        case 'staff-performance':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['John Smith', 'Maria Garcia', 'Carlos Rodriguez', 'Sarah Johnson', 'Ana Martinez'].map(staff => (
                  <div key={staff} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{staff}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tasks Complete</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="text-xs text-gray-600">Last activity: 2 hours ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        default:
          return <div>Report content not available</div>;
      }
    };

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Manager Reports</h1>
        
        {!selectedReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCategories.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="font-semibold mb-2">{report.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedReport.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Print Report
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Back
                </button>
              </div>
            </div>
            {renderReportContent()}
          </div>
        )}
      </div>
    );
  };import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, AlertCircle, Calendar, FileText, BookOpen, BarChart3, ClipboardCheck, Globe, User, Home, Pencil, Plus, X, Save, Check } from 'lucide-react';

const KitchenKontrol = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState({});
  
  // Dialog states
  const [editingPhases, setEditingPhases] = useState(false);
  const [editingRoles, setEditingRoles] = useState(false);
  const [editingAbsences, setEditingAbsences] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Editable data
  const [scheduleData, setScheduleData] = useState({
    currentPhase: 'prep',
    phases: {
      opening: { title: 'Opening', time: '7:00 AM', status: 'completed', tasks: { manager: ['Equipment checks', 'Start warmers', 'Verify deliveries'] } },
      prep: { title: 'Prep', time: '7:30 AM', status: 'active', tasks: { all: ['Daily huddle', 'Review assignments'] } },
      breakfast: { title: 'Breakfast Service', time: '7:30 AM', status: 'pending', tasks: { 'breakfast-rover': ['Load mobile racks', 'Deploy carts', 'Serve students'] } },
      'lunch-prep': { title: 'Lunch Prep', time: '9:00 AM', status: 'pending', tasks: { all: ['Set serving line', 'Portion sides', 'Prepare for service'] } },
      lunch: { title: 'Lunch Service', time: '10:30 AM', status: 'pending', tasks: { 'line-worker': ['Serve food', 'Monitor portions'], 'pos-worker': ['Process transactions', 'Manage flow'] } },
      cleaning: { title: 'Cleaning', time: '1:30 PM', status: 'pending', tasks: { all: ['Execute zone cleaning', 'Sanitize equipment'] } },
      closing: { title: 'Closing', time: '2:00 PM', status: 'pending', tasks: { manager: ['Final walkthrough', 'Complete reports', 'Secure facility'] } }
    }
  });

  const [roles, setRoles] = useState({
    'breakfast-rover': { 
      name: 'Breakfast Rover',
      assignedUser: 'Maria Garcia',
      tasks: ['Load mobile racks with breakfast items', 'Deploy carts to service locations', 'Serve students', 'Return and clean carts', 'Complete production logs']
    },
    'line-worker-1': { 
      name: 'Line Worker 1',
      assignedUser: 'John Smith',
      tasks: ['Set up serving line', 'Serve food portions', 'Monitor food temperatures', 'Maintain serving area']
    },
    'line-worker-2': { 
      name: 'Line Worker 2',
      assignedUser: 'Carlos Rodriguez',
      tasks: ['Assist with serving line', 'Portion side dishes', 'Restock serving area', 'Support lunch service']
    },
    'pos-worker-1': { 
      name: 'POS Worker 1',
      assignedUser: 'Sarah Johnson',
      tasks: ['Operate POS system', 'Process student transactions', 'Manage cash handling', 'Monitor meal compliance']
    },
    'pos-worker-2': { 
      name: 'POS Worker 2',
      assignedUser: 'Ana Martinez',
      tasks: ['Operate second POS station', 'Assist with transactions', 'Monitor student flow', 'Support compliance tracking']
    }
  });

  const [absentees, setAbsentees] = useState([
    { id: 1, name: 'Mike Wilson', date: '2025-09-15', reason: 'Personal', approved: false, approvalDate: null },
    { id: 2, name: 'Lisa Chen', date: '2025-09-16', reason: 'Training', approved: true, approvalDate: '2025-09-14' }
  ]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDateString = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTaskCompletion = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getPhaseColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handlePhaseClick = (phaseKey) => {
    setSelectedPhase(phaseKey);
  };

  const handleRoleClick = (roleKey) => {
    setSelectedRole(roleKey);
  };

  const handleUserClick = (userName) => {
    setSelectedUser(userName);
  };

  const handleApproveAbsence = (absenceId) => {
    setAbsentees(prev => prev.map(absence => 
      absence.id === absenceId 
        ? { ...absence, approved: true, approvalDate: new Date().toISOString().split('T')[0] }
        : absence
    ));
  };

  const NavigationBar = () => (
    <nav className="bg-blue-900 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold">Kitchen Kontrol</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('logs')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'logs' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              <FileText size={18} />
              <span>Daily Logs</span>
            </button>
            <button
              onClick={() => setCurrentView('training')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'training' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              <BookOpen size={18} />
              <span>Training</span>
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'reports' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              <BarChart3 size={18} />
              <span>Manager Reports</span>
            </button>
            <button
              onClick={() => setCurrentView('cleaning')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'cleaning' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              <ClipboardCheck size={18} />
              <span>Cleaning Zones</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-semibold">{getCurrentTimeString()}</div>
            <div className="text-sm text-blue-200">{getCurrentDateString()}</div>
          </div>
          <button
            onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'es' : 'en')}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-700 rounded hover:bg-blue-600"
          >
            <Globe size={18} />
            <span>{currentLanguage === 'en' ? 'ES' : 'EN'}</span>
          </button>
        </div>
      </div>
    </nav>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="p-6 space-y-6">
      {/* Daily Kitchen Phases */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Clock className="mr-2" />
            Daily Kitchen Phases
          </h2>
          <button 
            onClick={() => setEditingPhases(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded"
          >
            <Pencil size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(scheduleData.phases).map(([phase, data]) => (
            <button
              key={phase}
              onClick={() => handlePhaseClick(phase)}
              className={`p-3 rounded-lg border-2 text-center transition-colors hover:shadow-md ${getPhaseColor(data.status)}`}
            >
              <div className="font-semibold text-sm">{data.title}</div>
              <div className="text-xs mt-1">{data.time}</div>
              {data.status === 'active' && (
                <div className="mt-2">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Role Assignments */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Users className="mr-2" />
              Daily Role Assignments
            </h2>
            <button 
              onClick={() => setEditingRoles(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded"
            >
              <Pencil size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(roles).map(([roleKey, roleData]) => (
              <div key={roleKey} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <button 
                  onClick={() => handleRoleClick(roleKey)}
                  className="font-medium text-left hover:text-blue-600"
                >
                  {roleData.name}
                </button>
                <button 
                  onClick={() => handleUserClick(roleData.assignedUser)}
                  className="flex items-center space-x-2 hover:text-blue-600"
                >
                  <User size={16} />
                  <span>{roleData.assignedUser}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Absences */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Calendar className="mr-2" />
              Upcoming Absences
            </h2>
            <button 
              onClick={() => setEditingAbsences(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded"
            >
              <Pencil size={18} />
            </button>
          </div>
          {absentees.length > 0 ? (
            <div className="space-y-3">
              {absentees.map((absence) => (
                <div 
                  key={absence.id} 
                  className={`flex items-center justify-between p-3 rounded border-l-4 ${
                    absence.approved 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-yellow-50 border-yellow-400'
                  }`}
                >
                  <div>
                    <span className="font-medium">{absence.name}</span>
                    <div className="text-sm text-gray-600">{absence.reason}</div>
                    {absence.approved && (
                      <div className="text-xs text-green-600">
                        Approved: {absence.approvalDate}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{absence.date}</div>
                    {!absence.approved && (
                      <button
                        onClick={() => handleApproveAbsence(absence.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    {absence.approved && (
                      <div className="flex items-center text-green-600">
                        <Check size={16} />
                        <span className="text-sm ml-1">Approved</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming absences</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentView('logs')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 transition-colors"
          >
            <FileText className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="font-medium text-blue-800">Complete Daily Logs</div>
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 transition-colors"
          >
            <BarChart3 className="mx-auto mb-2 text-green-600" size={24} />
            <div className="font-medium text-green-800">View Reports</div>
          </button>
          <button
            onClick={() => setCurrentView('training')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 transition-colors"
          >
            <BookOpen className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="font-medium text-purple-800">Access Training</div>
          </button>
          <button
            onClick={() => setCurrentView('cleaning')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border-2 border-orange-200 transition-colors"
          >
            <ClipboardCheck className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="font-medium text-orange-800">Check Cleaning Status</div>
          </button>
        </div>
      </div>

      {/* Phase Tasks Modal */}
      <Modal
        isOpen={selectedPhase !== null}
        onClose={() => setSelectedPhase(null)}
        title={selectedPhase ? `${scheduleData.phases[selectedPhase]?.title} Tasks` : ''}
      >
        {selectedPhase && (
          <div className="space-y-4">
            {Object.entries(scheduleData.phases[selectedPhase]?.tasks || {}).map(([role, taskList]) => (
              <div key={role} className="border rounded p-3">
                <h4 className="font-semibold capitalize mb-2">{role.replace('-', ' ')}</h4>
                <div className="space-y-2">
                  {taskList.map((task, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{task}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Role Tasks Modal */}
      <Modal
        isOpen={selectedRole !== null}
        onClose={() => setSelectedRole(null)}
        title={selectedRole ? `${roles[selectedRole]?.name} Tasks` : ''}
      >
        {selectedRole && (
          <div className="space-y-3">
            {roles[selectedRole]?.tasks.map((task, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>{task}</span>
              </label>
            ))}
          </div>
        )}
      </Modal>

      {/* User Tasks Modal */}
      <Modal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `${selectedUser} - All Daily Tasks` : ''}
      >
        {selectedUser && (
          <div className="space-y-4">
            {Object.entries(roles)
              .filter(([_, roleData]) => roleData.assignedUser === selectedUser)
              .map(([roleKey, roleData]) => (
                <div key={roleKey} className="border rounded p-3">
                  <h4 className="font-semibold mb-2">{roleData.name}</h4>
                  <div className="space-y-2">
                    {roleData.tasks.map((task, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Edit Modals - Placeholder content */}
      <Modal isOpen={editingPhases} onClose={() => setEditingPhases(false)} title="Edit Daily Kitchen Phases">
        <div className="text-center py-8 text-gray-500">
          Phase editing interface would be implemented here.<br/>
          Features: Add/Edit/Delete phases, Set titles and times
        </div>
      </Modal>

      <Modal isOpen={editingRoles} onClose={() => setEditingRoles(false)} title="Edit Daily Role Assignments">
        <div className="text-center py-8 text-gray-500">
          Role assignment interface would be implemented here.<br/>
          Features: Assign workers to roles, Manage rotation, Edit tasks
        </div>
      </Modal>

      <Modal isOpen={editingAbsences} onClose={() => setEditingAbsences(false)} title="Manage Absences">
        <div className="text-center py-8 text-gray-500">
          Absence management interface would be implemented here.<br/>
          Features: Add/Edit/Delete absences, Approval workflow
        </div>
      </Modal>
    </div>
  );

  const LogsView = () => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [logEntries, setLogEntries] = useState({
      'equipment-temps': {
        entries: [
          { equipment: 'Walk-in Fridge', morning: '', afternoon: '', initial: 'JS' },
          { equipment: 'Freezer', morning: '', afternoon: '', initial: 'JS' },
          { equipment: 'Milk Cooler 1', morning: '', afternoon: '', initial: 'MG' },
          { equipment: 'Milk Cooler 2', morning: '', afternoon: '', initial: 'MG' },
          { equipment: 'Warmer 1', morning: '', afternoon: '', initial: 'CR' },
          { equipment: 'Warmer 2', morning: '', afternoon: '', initial: 'CR' }
        ]
      },
      'food-temps': {
        entries: [
          { item: 'Main Entree', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'SJ' },
          { item: 'Side Dish 1', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'AM' },
          { item: 'Side Dish 2', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'AM' },
          { item: 'Vegetables', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'CR' }
        ]
      },
      'cleaning-zones': {
        entries: [
          { zone: 'Zone 1: Serving Line', assignee: 'John Smith', completed: false, initial: '' },
          { zone: 'Zone 2: Dish Pit', assignee: 'Maria Garcia', completed: false, initial: '' },
          { zone: 'Zone 3: FOH/POS', assignee: 'Carlos Rodriguez', completed: false, initial: '' },
          { zone: 'Zone 4: Floors/Utility', assignee: 'Sarah Johnson', completed: false, initial: '' },
          { zone: 'Zone 5: Monitor/Compliance', assignee: 'Ana Martinez', completed: false, initial: '' }
        ]
      },
      'sanitation-setup': {
        entries: [
          { station: 'Hand Wash Station 1', sanitizer: '', paperTowels: '', soap: '', completed: false, initial: '' },
          { station: 'Hand Wash Station 2', sanitizer: '', paperTowels: '', soap: '', completed: false, initial: '' },
          { station: '3-Compartment Sink', sanitizer: '', testStrips: '', completed: false, initial: '' }
        ]
      },
      'reimbursable-meals': {
        entries: [
          { meal: 'Breakfast', planned: 250, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 1', planned: 220, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 2', planned: 240, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 3', planned: 210, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 4', planned: 180, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 }
        ]
      }
    });

    const logCategories = [
      { id: 'equipment-temps', name: 'Equipment Temperatures', status: completedTasks['equipment-temps'] ? 'completed' : 'pending' },
      { id: 'food-temps', name: 'Food Temperatures', status: completedTasks['food-temps'] ? 'completed' : 'pending' },
      { id: 'cleaning-zones', name: 'Zone Cleaning', status: completedTasks['cleaning-zones'] ? 'completed' : 'pending' },
      { id: 'sanitation-setup', name: 'Sanitation Setup', status: completedTasks['sanitation-setup'] ? 'completed' : 'pending' },
      { id: 'reimbursable-meals', name: 'Reimbursable Meals', status: completedTasks['reimbursable-meals'] ? 'completed' : 'pending' }
    ];

    const updateLogEntry = (logType, index, field, value) => {
      setLogEntries(prev => ({
        ...prev,
        [logType]: {
          ...prev[logType],
          entries: prev[logType].entries.map((entry, i) => 
            i === index ? { ...entry, [field]: value } : entry
          )
        }
      }));
    };

    const renderLogForm = () => {
      if (!selectedLog) return null;
      
      const currentLog = logEntries[selectedLog.id];
      
      switch (selectedLog.id) {
        case 'equipment-temps':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2">
                <div>Equipment</div>
                <div>Morning Temp</div>
                <div>Afternoon Temp</div>
                <div>Initial</div>
              </div>
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <div className="flex items-center">{entry.equipment}</div>
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-2"
                    value={entry.morning}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'morning', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-2"
                    value={entry.afternoon}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'afternoon', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Initials"
                    className="border rounded p-2"
                    value={entry.initial}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        
        case 'food-temps':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 font-semibold border-b pb-2 text-sm">
                <div>Food Item</div>
                <div>Arrival</div>
                <div>Pre-Service</div>
                <div>Mid-Service</div>
                <div>Portions</div>
                <div>Waste</div>
                <div>Initial</div>
              </div>
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-7 gap-2">
                  <div className="flex items-center text-sm">{entry.item}</div>
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-1 text-sm"
                    value={entry.arrival}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'arrival', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-1 text-sm"
                    value={entry.preService}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'preService', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-1 text-sm"
                    value={entry.midService}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'midService', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    className="border rounded p-1 text-sm"
                    value={entry.portions}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'portions', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    className="border rounded p-1 text-sm"
                    value={entry.waste}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'waste', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Init"
                    className="border rounded p-1 text-sm"
                    value={entry.initial}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        
        case 'cleaning-zones':
          return (
            <div className="space-y-4">
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{entry.zone}</div>
                    <div className="text-sm text-gray-600">Assigned: {entry.assignee}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Initials"
                      className="border rounded p-2 w-20"
                      value={entry.initial}
                      onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={entry.completed}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'completed', e.target.checked)}
                      />
                      <span>Complete</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          );
        
        case 'reimbursable-meals':
          return (
            <div className="space-y-4">
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Service Period</label>
                      <div className="text-sm">{entry.meal}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Planned</label>
                      <div className="text-sm">{entry.planned}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Served</label>
                      <input
                        type="number"
                        className="border rounded p-1 w-full"
                        value={entry.served}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'served', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Waste</label>
                      <input
                        type="number"
                        className="border rounded p-1 w-full"
                        value={entry.waste}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'waste', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Components (check 3 of 5)</label>
                    <div className="grid grid-cols-5 gap-4">
                      {Object.entries(entry.components).map(([component, checked]) => (
                        <label key={component} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateLogEntry(selectedLog.id, index, 'components', {
                              ...entry.components,
                              [component]: e.target.checked
                            })}
                          />
                          <span className="text-sm capitalize">{component}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        
        default:
          return <div>Log form not implemented</div>;
      }
    };

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Daily Logs</h1>
        
        {!selectedLog ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logCategories.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{log.name}</h3>
                  {log.status === 'completed' ? (
                    <CheckCircle2 className="text-green-600" size={24} />
                  ) : (
                    <AlertCircle className="text-orange-600" size={24} />
                  )}
                </div>
                <button
                  onClick={() => setSelectedLog(log)}
                  className={`w-full py-2 px-4 rounded font-medium ${
                    log.status === 'completed'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {log.status === 'completed' ? 'View/Edit Log' : 'Complete Log'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedLog.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    handleTaskCompletion(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Save size={16} className="inline mr-2" />
                  Save & Complete
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Back
                </button>
              </div>
            </div>
            {renderLogForm()}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'logs':
        return <LogsView />;
      case 'reports':
        return <ReportsView />;
      case 'training':
        return <div className="p-6"><h1 className="text-2xl font-bold">Training Module - Coming Soon</h1></div>;
      case 'cleaning':
        return <div className="p-6"><h1 className="text-2xl font-bold">Cleaning Zones - Coming Soon</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />
      {renderCurrentView()}
    </div>
  );
};

export default KitchenKontrol;
