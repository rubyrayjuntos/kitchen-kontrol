
import React, { useState } from 'react';
import UsersWidget from './UsersWidget';
import RolesWidget from './RolesWidget';
import TasksWidget from './TasksWidget';
import UserTasks from './UserTasks';
import RolePhaseWidget from './RolePhaseWidget';
import useStore from '../store';

const ReportsView = () => {
    const { auditLog, staffPerformance } = useStore();
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '2025-09-16', end: '2025-09-22' });
    
    // Sample data for reports
    const weeklyLogStatus = {
      'Equipment Temps': { completed: 5, total: 5, percentage: 100 },
      'Food Temps': { completed: 5, total: 5, percentage: 100 },
                  'Planogram Logs': { completed: 4, total: 5, percentage: 80 },      'Sanitation Setup': { completed: 5, total: 5, percentage: 100 },
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

    const reportCategories = [
      { id: 'weekly-status', name: 'Weekly Log Status', description: 'Completion rates for all required logs' },
      { id: 'reimbursable-meals', name: 'Reimbursable Meals Report', description: 'Daily meal counts and revenue tracking' },
      { id: 'audit-trail', name: 'Audit Trail', description: 'Complete log of all system entries and modifications' },
      { id: 'compliance-summary', name: 'Compliance Summary', description: 'Overview of all compliance requirements' },
      { id: 'staff-performance', name: 'Staff Performance', description: 'Individual staff task completion tracking' },
      { id: 'user-management', name: 'User Management', description: 'Add, edit, and delete users' },
      { id: 'roles-management', name: 'Roles Management', description: 'Add, edit, and delete roles' },
      { id: 'tasks-management', name: 'Tasks Management', description: 'Add, edit, and delete tasks' },
      { id: 'user-tasks', name: 'User Tasks', description: 'View tasks assigned to users' },
      { id: 'role-phases', name: 'Role Phases', description: 'Assign roles to phases' }
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
                                                <span>Planogram Logs - Friday</span>                    <span className="text-red-600 text-sm">1 day overdue</span>
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
                  {auditLog.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <div className="font-medium">{entry.action}</div>
                        <div className="text-sm text-gray-600">by {entry.user}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{new Date(entry.timestamp).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">{new Date(entry.timestamp).toLocaleTimeString()}</div>
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
                        <li>! Planogram logs - 1 missing entry</li>
                        <li>! Zone 3 planogram - Needs manager verification</li>
                  </ul>
                </div>
              </div>
            </div>
          );

        case 'staff-performance':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffPerformance.map(staff => (
                  <div key={staff.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{staff.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tasks Complete</span>
                        <span className="font-semibold">{staff.tasksComplete.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${staff.tasksComplete}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-600">Last activity: {staff.lastActivity ? new Date(staff.lastActivity).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'user-management':
            return <UsersWidget />;

        case 'roles-management':
            return <RolesWidget />;

        case 'tasks-management':
            return <TasksWidget />;

        case 'user-tasks':
            return <UserTasks />;

        case 'role-phases':
            return <RolePhaseWidget />;

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
}

export default ReportsView;