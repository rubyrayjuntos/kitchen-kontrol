
import React, { useState } from 'react';
import { Printer, ArrowLeft, FileText, Download, Calendar } from 'lucide-react';
import UsersWidget from './UsersWidget';
import RolesWidget from './RolesWidget';
import TasksWidget from './TasksWidget';
import UserTasks from './UserTasks';
import RolePhaseWidget from './RolePhaseWidget';
import useStore from '../../store';

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div className="demo-grid">
                {Object.entries(weeklyLogStatus).map(([logName, data]) => (
                  <div key={logName} className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                    <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>{logName}</h4>
                    <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-2)' }}>
                      <span className="text-2xl font-bold">{data.completed}/{data.total}</span>
                      <span className={`badge ${
                        data.percentage === 100 ? 'badge-success' : 
                        data.percentage >= 80 ? 'badge-warning' :
                        'badge-error'
                      }`} style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                        {data.percentage}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          borderRadius: 'var(--radius-full)',
                          width: `${data.percentage}%`,
                          backgroundColor: data.percentage === 100 ? 'var(--success)' :
                                         data.percentage >= 80 ? 'var(--warning)' :
                                         'var(--error)',
                          transition: 'width 0.3s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-4)' }}>Missing Logs</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  <div className="d-flex items-center justify-between" style={{ 
                    padding: 'var(--spacing-2)', 
                    backgroundColor: 'rgba(var(--error-rgb), 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--error)'
                  }}>
                    <span>Planogram Logs - Friday</span>
                    <span className="text-error" style={{ fontSize: 'var(--font-size-sm)' }}>1 day overdue</span>
                  </div>
                  <div className="d-flex items-center justify-between" style={{ 
                    padding: 'var(--spacing-2)', 
                    backgroundColor: 'rgba(var(--warning-rgb), 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--warning)'
                  }}>
                    <span>Reimbursable Meals - Monday, Wednesday</span>
                    <span className="text-warning" style={{ fontSize: 'var(--font-size-sm)' }}>Incomplete data</span>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'reimbursable-meals':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                <div className="neumorphic-raised" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--primary)', color: 'white' }}>
                  <div className="text-2xl font-bold">{reimbursableMealsData.totalBreakfast}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Total Breakfast</div>
                </div>
                <div className="neumorphic-raised" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--success)', color: 'white' }}>
                  <div className="text-2xl font-bold">{reimbursableMealsData.totalLunch}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Total Lunch</div>
                </div>
                <div className="neumorphic-raised" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--accent)', color: 'white' }}>
                  <div className="text-2xl font-bold">{(reimbursableMealsData.totalBreakfast + reimbursableMealsData.totalLunch).toLocaleString()}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Total Meals</div>
                </div>
                <div className="neumorphic-raised" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--warning)', color: 'white' }}>
                  <div className="text-2xl font-bold">${reimbursableMealsData.totalRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Total Revenue</div>
                </div>
              </div>

              {/* Daily Breakdown Table */}
              <div className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-4)' }}>Daily Breakdown</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                        <th style={{ textAlign: 'left', padding: 'var(--spacing-2)', fontWeight: '600' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: 'var(--spacing-2)', fontWeight: '600' }}>Breakfast</th>
                        <th style={{ textAlign: 'left', padding: 'var(--spacing-2)', fontWeight: '600' }}>Lunch</th>
                        <th style={{ textAlign: 'left', padding: 'var(--spacing-2)', fontWeight: '600' }}>Total Meals</th>
                        <th style={{ textAlign: 'left', padding: 'var(--spacing-2)', fontWeight: '600' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reimbursableMealsData.dailyBreakdown.map((day, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                          <td style={{ padding: 'var(--spacing-2)' }}>{day.date}</td>
                          <td style={{ padding: 'var(--spacing-2)' }}>{day.breakfast}</td>
                          <td style={{ padding: 'var(--spacing-2)' }}>{day.lunch}</td>
                          <td style={{ padding: 'var(--spacing-2)', fontWeight: '600' }}>{day.breakfast + day.lunch}</td>
                          <td style={{ padding: 'var(--spacing-2)', fontWeight: '600' }}>${day.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue Calculation */}
              <div className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-4)' }}>Revenue Calculation</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  <div className="d-flex justify-between">
                    <span>Breakfast: {reimbursableMealsData.totalBreakfast} meals × $2.15</span>
                    <span className="font-semibold">${reimbursableMealsData.breakfastRevenue.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-between">
                    <span>Lunch: {reimbursableMealsData.totalLunch} meals × $3.25</span>
                    <span className="font-semibold">${reimbursableMealsData.lunchRevenue.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-between text-lg font-bold" style={{ 
                    borderTop: '2px solid var(--border-primary)', 
                    paddingTop: 'var(--spacing-2)',
                    marginTop: 'var(--spacing-2)'
                  }}>
                    <span>Total Revenue</span>
                    <span>${reimbursableMealsData.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'audit-trail':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div className="d-flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
                <div className="form-field" style={{ flex: '1 1 200px' }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-2)' }}
                  />
                </div>
                <div className="form-field" style={{ flex: '1 1 200px' }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-2)' }}
                  />
                </div>
                <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-5)' }}>
                  <Calendar size={16} style={{ marginRight: 'var(--spacing-1)' }} />
                  Filter
                </button>
                <button className="btn btn-success" style={{ marginTop: 'var(--spacing-5)' }}>
                  <Download size={16} style={{ marginRight: 'var(--spacing-1)' }} />
                  Export CSV
                </button>
              </div>

              <div className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-4)' }}>Recent Activity</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  {auditLog.map((entry, index) => (
                    <div key={index} className="neumorphic-raised" style={{ padding: 'var(--spacing-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div className="font-medium">{entry.action}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          by {entry.user}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'compliance-summary':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
                <div className="neumorphic-inset" style={{ 
                  padding: 'var(--spacing-4)', 
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--success)'
                }}>
                  <h4 className="font-semibold text-success" style={{ marginBottom: 'var(--spacing-2)' }}>
                    Compliant Items
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)' }}>
                    <li>✓ Equipment temperature logs - 100% complete</li>
                    <li>✓ Food temperature monitoring - On schedule</li>
                    <li>✓ Sanitation setup verified daily</li>
                    <li>✓ Staff training up to date</li>
                  </ul>
                </div>
                <div className="neumorphic-inset" style={{ 
                  padding: 'var(--spacing-4)', 
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--warning)'
                }}>
                  <h4 className="font-semibold text-warning" style={{ marginBottom: 'var(--spacing-2)' }}>
                    Action Required
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)' }}>
                    <li>! Planogram logs - 1 missing entry</li>
                    <li>! Zone 3 planogram - Needs manager verification</li>
                  </ul>
                </div>
              </div>
            </div>
          );

        case 'staff-performance':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div className="demo-grid">
                {staffPerformance.map(staff => (
                  <div key={staff.id} className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                    <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>{staff.name}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <div className="d-flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                        <span>Tasks Complete</span>
                        <span className="font-semibold">{staff.tasksComplete.toFixed(2)}%</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%', 
                          backgroundColor: 'var(--success)', 
                          borderRadius: 'var(--radius-full)', 
                          width: `${staff.tasksComplete}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        Last activity: {staff.lastActivity ? new Date(staff.lastActivity).toLocaleString() : 'N/A'}
                      </div>
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
      <div style={{ padding: 'var(--spacing-6)' }}>
        <h1 className="text-neumorphic-embossed" style={{ 
          fontSize: 'var(--font-size-2xl)', 
          fontWeight: '700',
          marginBottom: 'var(--spacing-6)' 
        }}>
          Manager Reports
        </h1>
        
        {!selectedReport ? (
          <div className="demo-grid">
            {reportCategories.map((report) => (
              <div key={report.id} className="neumorphic-raised" style={{ 
                padding: 'var(--spacing-6)',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}>
                <h3 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>{report.name}</h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 'var(--font-size-sm)', 
                  marginBottom: 'var(--spacing-4)' 
                }}>
                  {report.description}
                </p>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontWeight: '500' }}
                >
                  <FileText size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                  View Report
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-lg">
            <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2 className="text-xl font-bold text-neumorphic-embossed">{selectedReport.name}</h2>
              <div className="d-flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-success"
                >
                  <Printer size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                  Print Report
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="btn btn-ghost"
                >
                  <ArrowLeft size={16} style={{ marginRight: 'var(--spacing-2)' }} />
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