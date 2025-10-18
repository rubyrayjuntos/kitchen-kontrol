import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText
} from 'lucide-react';
import useStore from '../../store';
import { apiRequest } from '../../utils/api';

/**
 * LogReportsView - Display analytics and reports for the logs system
 * 
 * Shows 3 main reports:
 * 1. Weekly Log Status - Completion rates
 * 2. Reimbursable Meals - Revenue tracking
 * 3. Compliance Summary - Violations and issues
 */
const LogReportsView = () => {
  const { user } = useStore();
  
  // Active tab
  const [activeTab, setActiveTab] = useState('weekly-status');
  
  // Data state
  const [weeklyStatus, setWeeklyStatus] = useState(null);
  const [mealsData, setMealsData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range for filters (default: last 7 days)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user?.token) return;
      try {
        const data = await apiRequest('/api/logs/templates', user.token);
        setTemplateOptions(data);
        setSelectedTemplates((prev) => {
          if (prev.length > 0) return prev;
          return data.map((tpl) => String(tpl.id));
        });
      } catch (err) {
        console.error('Failed to load log templates for reports:', err);
      }
    };

    loadTemplates();
  }, [user?.token]);

  // Fetch all reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [weekly, meals, compliance] = await Promise.all([
        apiRequest('/api/reports/weekly-log-status', user.token),
        apiRequest(
          `/api/reports/reimbursable-meals?start_date=${dateRange.start}&end_date=${dateRange.end}`,
          user.token
        ),
        apiRequest(
          `/api/reports/compliance-summary?start_date=${dateRange.start}&end_date=${dateRange.end}`,
          user.token
        ),
      ]);

      setWeeklyStatus(weekly);
      setMealsData(meals);
      setComplianceData(compliance);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, dateRange.start, dateRange.end]);

  const fetchLogHistory = useCallback(async () => {
    if (!user?.token) {
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      if (selectedTemplates.length === 0) {
        setHistoryData({
          date_range: {
            start: dateRange.start,
            end: dateRange.end
          },
          submissions: []
        });
        setHistoryLoading(false);
        return;
      }

      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      });

      params.set('template_ids', selectedTemplates.join(','));

      const history = await apiRequest(`/api/reports/log-history?${params.toString()}`, user.token);
      setHistoryData(history);
    } catch (err) {
      console.error('Error fetching log history:', err);
      setHistoryError(err.message || 'Failed to load log history');
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.token, dateRange.start, dateRange.end, selectedTemplates]);

  // Fetch on mount and when date range changes
  useEffect(() => {
    if (user?.token) {
      fetchReports();
    }
  }, [user?.token, fetchReports]);

  useEffect(() => {
    if (activeTab === 'history' && user?.token) {
      fetchLogHistory();
    }
  }, [activeTab, user?.token, fetchLogHistory]);

  const handleRefresh = useCallback(() => {
    fetchReports();
    if (activeTab === 'history') {
      fetchLogHistory();
    }
  }, [fetchReports, fetchLogHistory, activeTab]);

  const toggleTemplateSelection = useCallback((templateId) => {
    setSelectedTemplates((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((id) => id !== templateId);
      }
      return [...prev, templateId];
    });
  }, []);

  const selectAllTemplates = useCallback(() => {
    setSelectedTemplates(templateOptions.map((tpl) => String(tpl.id)));
  }, [templateOptions]);

  const clearTemplateSelection = useCallback(() => {
    setSelectedTemplates([]);
  }, []);

  const templateLookup = useMemo(() => {
    return templateOptions.reduce((acc, tpl) => {
      acc[tpl.id] = tpl;
      return acc;
    }, {});
  }, [templateOptions]);

  const formatKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-secondary">—</span>;
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      if (value.includes('\n')) {
        return (
          <pre style={{
            margin: 0,
            background: 'rgba(15,23,42,0.04)',
            padding: 'var(--spacing-2)',
            borderRadius: 'var(--radius-sm)'
          }}>{value}</pre>
        );
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return (
      <pre style={{
        margin: 0,
        background: 'rgba(15,23,42,0.04)',
        padding: 'var(--spacing-2)',
        borderRadius: 'var(--radius-sm)'
      }}>{JSON.stringify(value, null, 2)}</pre>
    );
  };

  // Render weekly status report
  const renderWeeklyStatus = () => {
    if (!weeklyStatus) return null;

    const { week_start, week_end, templates } = weeklyStatus;

    return (
      <div>
        <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
          <div>
            <h3 className="text-xl font-bold">Weekly Log Status</h3>
            <p className="text-sm text-secondary">
              {week_start} to {week_end}
            </p>
          </div>
          <button onClick={fetchReports} className="btn btn-outline" style={{ padding: 'var(--spacing-2)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="card-sm text-center" style={{ padding: 'var(--spacing-8)' }}>
            <BarChart3 size={48} style={{ margin: '0 auto var(--spacing-4)', opacity: 0.3 }} />
            <p className="text-secondary">No log assignments in this period</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            {templates.map((template) => {
              const completionColor = 
                template.completion_rate >= 90 ? 'var(--color-success)' :
                template.completion_rate >= 70 ? 'var(--color-warning)' :
                'var(--color-error)';

              return (
                <div key={template.template_id} className="card-sm">
                  <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-3)' }}>
                    <div>
                      <h4 className="font-semibold">{template.template_name}</h4>
                      <p className="text-xs text-secondary">{template.category}</p>
                    </div>
                    <div 
                      style={{ 
                        fontSize: 'var(--font-size-xl)', 
                        fontWeight: '700',
                        color: completionColor 
                      }}
                    >
                      {template.completion_rate}%
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div 
                    style={{ 
                      height: '8px', 
                      background: 'var(--color-surface)', 
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: 'var(--spacing-2)'
                    }}
                  >
                    <div 
                      style={{ 
                        height: '100%', 
                        background: completionColor,
                        width: `${template.completion_rate}%`,
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>

                  <div className="d-flex gap-4 text-xs">
                    <div className="d-flex items-center gap-1">
                      <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
                      <span>{template.completed} completed</span>
                    </div>
                    <div className="d-flex items-center gap-1">
                      <Clock size={14} style={{ color: 'var(--color-warning)' }} />
                      <span>{template.pending} pending</span>
                    </div>
                    <div className="d-flex items-center gap-1 text-secondary">
                      <span>{template.total_assignments} total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLogHistory = () => {
    if (historyLoading && !historyData) {
      return (
        <div className="card-sm text-center" style={{ padding: 'var(--spacing-8)' }}>
          <div className="spinner" style={{ margin: '0 auto var(--spacing-4)' }} />
          <p className="text-secondary">Loading log history…</p>
        </div>
      );
    }

    if (historyError) {
      return (
        <div className="card-sm" style={{ padding: 'var(--spacing-4)', color: 'var(--color-error)' }}>
          <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>Unable to load log history</h4>
          <p className="text-sm" style={{ marginBottom: 'var(--spacing-3)' }}>{historyError}</p>
          <button className="btn btn-primary" onClick={fetchLogHistory} disabled={historyLoading}>
            Retry
          </button>
        </div>
      );
    }

    if (!historyData) {
      return (
        <div className="card-sm text-center" style={{ padding: 'var(--spacing-8)' }}>
          <FileText size={48} style={{ margin: '0 auto var(--spacing-4)', opacity: 0.3 }} />
          <p className="text-secondary">Choose a date range and templates, then click update.</p>
        </div>
      );
    }

    const submissions = historyData.submissions || [];

    if (submissions.length === 0) {
      if (selectedTemplates.length === 0) {
        return (
          <div className="card-sm text-center" style={{ padding: 'var(--spacing-8)' }}>
            <FileText size={48} style={{ margin: '0 auto var(--spacing-4)', opacity: 0.3 }} />
            <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>Select at least one log template</h4>
            <p className="text-secondary">Use the template filters above to choose which logs to view.</p>
          </div>
        );
      }
      return (
        <div className="card-sm text-center" style={{ padding: 'var(--spacing-8)' }}>
          <FileText size={48} style={{ margin: '0 auto var(--spacing-4)', opacity: 0.3 }} />
          <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>No log submissions</h4>
          <p className="text-secondary">Try expanding the date range or selecting additional templates.</p>
        </div>
      );
    }

    const grouped = submissions.reduce((acc, submission) => {
      const key = submission.template_id;
      if (!acc[key]) {
        acc[key] = {
          template: submission.template_name,
          category: submission.category,
          entries: []
        };
      }
      acc[key].entries.push(submission);
      return acc;
    }, {});

    const sections = Object.entries(grouped).sort((a, b) => {
      const nameA = a[1].template.toLowerCase();
      const nameB = b[1].template.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const statusBaseStyle = {
      fontSize: '0.78rem',
      borderRadius: '999px',
      padding: '0.25rem 0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      letterSpacing: '0.02em',
      textTransform: 'capitalize'
    };

    return (
      <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
        <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-2)' }}>
          <p className="text-sm text-secondary">
            {historyData.date_range.start} to {historyData.date_range.end} • {submissions.length} submission{submissions.length === 1 ? '' : 's'}
          </p>
        </div>

        {sections.map(([templateId, info]) => {
          const tplMeta = templateLookup[templateId];
          const frequencyLabel = tplMeta?.frequency;
          const entries = info.entries
            .slice()
            .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));

          return (
            <div key={templateId} className="card-sm" style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
              <div className="d-flex items-center justify-between">
                <div>
                  <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-1)' }}>{info.template}</h4>
                  <p className="text-xs text-secondary">
                    {info.category}{frequencyLabel ? ` • ${frequencyLabel}` : ''} • {entries.length} submission{entries.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
                {entries.map((entry) => {
                  const statusStyle = {
                    ...statusBaseStyle,
                    background: entry.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                    color: entry.status === 'completed' ? '#15803d' : '#b45309',
                    border: entry.status === 'completed'
                      ? '1px solid rgba(22,163,74,0.4)'
                      : '1px solid rgba(217,119,6,0.32)'
                  };

                  return (
                    <div key={entry.id} className="neumorphic-inset" style={{ padding: 'var(--spacing-4)' }}>
                      <div className="d-flex items-start justify-between" style={{ marginBottom: 'var(--spacing-3)' }}>
                        <div>
                          <div className="font-semibold text-sm" style={{ marginBottom: 'var(--spacing-1)' }}>
                            {new Date(entry.submitted_at).toLocaleString()} ({entry.submission_date})
                          </div>
                          <div className="text-xs text-secondary">
                            Submitted by {entry.submitted_by_name}
                          </div>
                        </div>
                        <span className="logs-status-pill" style={statusStyle}>
                          {entry.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                        {Object.entries(entry.data || {}).map(([field, value]) => (
                          <div key={field} style={{ display: 'grid', gap: 'var(--spacing-1)' }}>
                            <div className="text-xs text-secondary">{formatKey(field)}</div>
                            <div className="text-sm">{renderValue(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render reimbursable meals report
  const renderMealsReport = () => {
    if (!mealsData) return null;

    const { summary, daily_breakdown } = mealsData;

    return (
      <div>
        <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
          <div>
            <h3 className="text-xl font-bold">Reimbursable Meals Report</h3>
            <p className="text-sm text-secondary">
              {mealsData.date_range.start} to {mealsData.date_range.end}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)'
        }}>
          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <DollarSign size={20} style={{ color: 'var(--color-success)' }} />
              <span className="text-sm text-secondary">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
              ${summary.total_revenue.toFixed(2)}
            </div>
          </div>

          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm text-secondary">Total Meals</span>
            </div>
            <div className="text-2xl font-bold">
              {summary.total_meals.toLocaleString()}
            </div>
          </div>

          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm text-secondary">Avg per Day</span>
            </div>
            <div className="text-2xl font-bold">
              {summary.avg_meals_per_day.toFixed(1)}
            </div>
          </div>

          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <DollarSign size={20} style={{ color: 'var(--color-secondary)' }} />
              <span className="text-sm text-secondary">Rate</span>
            </div>
            <div className="text-2xl font-bold">
              ${summary.reimbursement_rate.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Daily breakdown table */}
        {daily_breakdown.length > 0 && (
          <div className="card-sm">
            <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-3)' }}>
              Daily Breakdown
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'right' }}>Meals</th>
                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'right' }}>Revenue</th>
                    <th style={{ padding: 'var(--spacing-2)', textAlign: 'right' }}>Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {daily_breakdown.map((day) => (
                    <tr 
                      key={day.date}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td style={{ padding: 'var(--spacing-2)' }}>{day.date}</td>
                      <td style={{ padding: 'var(--spacing-2)', textAlign: 'right', fontWeight: '600' }}>
                        {day.meals.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: 'var(--spacing-2)', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: 'var(--color-success)'
                      }}>
                        ${day.revenue.toFixed(2)}
                      </td>
                      <td style={{ padding: 'var(--spacing-2)', textAlign: 'right', color: 'var(--color-secondary)' }}>
                        {day.submissions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render compliance summary
  const renderComplianceSummary = () => {
    if (!complianceData) return null;

    const { summary, violations_by_type } = complianceData;

    const violationRateColor = 
      summary.violation_rate < 5 ? 'var(--color-success)' :
      summary.violation_rate < 10 ? 'var(--color-warning)' :
      'var(--color-error)';

    return (
      <div>
        <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
          <div>
            <h3 className="text-xl font-bold">Compliance Summary</h3>
            <p className="text-sm text-secondary">
              {complianceData.date_range.start} to {complianceData.date_range.end}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)'
        }}>
          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm text-secondary">Total Submissions</span>
            </div>
            <div className="text-2xl font-bold">
              {summary.total_submissions}
            </div>
          </div>

          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <AlertTriangle size={20} style={{ color: violationRateColor }} />
              <span className="text-sm text-secondary">Violations</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: violationRateColor }}>
              {summary.total_violations}
            </div>
          </div>

          <div className="card-sm">
            <div className="d-flex items-center gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
              <BarChart3 size={20} style={{ color: violationRateColor }} />
              <span className="text-sm text-secondary">Violation Rate</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: violationRateColor }}>
              {summary.violation_rate}%
            </div>
          </div>
        </div>

        {/* Violations by type */}
        {violations_by_type.length === 0 ? (
          <div className="card-sm text-center" style={{ padding: 'var(--spacing-8)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto var(--spacing-4)', color: 'var(--color-success)' }} />
            <h4 className="font-semibold" style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-2)' }}>
              No Violations Found! 🎉
            </h4>
            <p className="text-secondary">All logs are compliant in this period</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            {violations_by_type.map((typeGroup) => (
              <div key={typeGroup.log_type} className="card-sm">
                <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-3)' }}>
                  <div>
                    <h4 className="font-semibold">{typeGroup.log_type}</h4>
                    <p className="text-xs text-secondary">{typeGroup.category}</p>
                  </div>
                  <div 
                    className="badge"
                    style={{ 
                      background: 'var(--color-error)',
                      color: 'white',
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '600'
                    }}
                  >
                    {typeGroup.violation_count} violation{typeGroup.violation_count !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* List violations */}
                <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                  {typeGroup.violations.map((violation, idx) => (
                    <div 
                      key={idx}
                      className="neumorphic-inset"
                      style={{ padding: 'var(--spacing-3)' }}
                    >
                      <div className="d-flex items-start gap-2" style={{ marginBottom: 'var(--spacing-2)' }}>
                        <XCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                          <div className="font-semibold text-sm">{violation.issue}</div>
                          <div className="text-xs text-secondary">
                            {new Date(violation.submitted_at).toLocaleString()} • {violation.submitted_by}
                          </div>
                        </div>
                      </div>
                      
                      {violation.details && (
                        <div className="text-xs" style={{ 
                          marginLeft: '24px',
                          marginBottom: 'var(--spacing-2)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {JSON.stringify(violation.details, null, 2)}
                        </div>
                      )}
                      
                      {violation.corrective_action && (
                        <div className="text-xs" style={{ 
                          marginLeft: '24px',
                          padding: 'var(--spacing-2)',
                          background: 'var(--color-primary-alpha)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--color-primary)'
                        }}>
                          <strong>Corrective Action:</strong> {violation.corrective_action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Main render
  if (loading && !weeklyStatus && !mealsData && !complianceData && activeTab !== 'history') {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-neumorphic-embossed" style={{ marginBottom: 'var(--spacing-6)' }}>
          Log Reports & Analytics
        </h1>
        <div className="card-lg text-center" style={{ padding: 'var(--spacing-8)' }}>
          <div className="spinner" style={{ margin: '0 auto var(--spacing-4)' }} />
          <p className="text-secondary">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-neumorphic-embossed" style={{ marginBottom: 'var(--spacing-6)' }}>
          Log Reports & Analytics
        </h1>
        <div className="card-lg" style={{ padding: 'var(--spacing-6)' }}>
          <div className="d-flex items-center gap-3" style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-4)' }}>
            <AlertTriangle size={24} />
            <div>
              <h3 className="font-semibold">Error Loading Reports</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button onClick={fetchReports} className="btn btn-primary">
            <RefreshCw size={16} style={{ marginRight: 'var(--spacing-2)' }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-neumorphic-embossed" style={{ marginBottom: 'var(--spacing-6)' }}>
        Log Reports & Analytics
      </h1>

      {/* Date range picker */}
      <div className="card-lg" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="d-flex items-center gap-4 flex-wrap">
          <div className="d-flex items-center gap-2">
            <Calendar size={20} style={{ color: 'var(--color-accent)' }} />
            <span className="font-semibold">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="neumorphic-input"
            style={{ width: 'auto' }}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="neumorphic-input"
            style={{ width: 'auto' }}
          />
          <button onClick={handleRefresh} className="btn btn-primary" disabled={loading || historyLoading}>
            {loading || historyLoading ? 'Loading...' : 'Update'}
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="neumorphic-inset" style={{ padding: 'var(--spacing-4)', marginTop: 'var(--spacing-4)', width: '100%' }}>
            <div className="d-flex items-start justify-between" style={{ marginBottom: 'var(--spacing-3)', gap: 'var(--spacing-3)' }}>
              <div>
                <h4 className="font-semibold text-base" style={{ marginBottom: 'var(--spacing-1)' }}>Filter by Log Template</h4>
                <p className="text-xs text-secondary">
                  Select specific logs to narrow the results. Auditors typically review Food Temperatures and Equipment Temperatures.
                </p>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={selectAllTemplates} disabled={templateOptions.length === 0}>
                  Select All
                </button>
                <button type="button" className="btn btn-ghost" onClick={clearTemplateSelection}>
                  Clear
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
              {templateOptions.map((template) => {
                const id = String(template.id);
                const checked = selectedTemplates.includes(id);
                return (
                  <label
                    key={template.id}
                    className="neumorphic-inset"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTemplateSelection(id)}
                    />
                    <span className="text-sm" style={{ fontWeight: checked ? 600 : 400 }}>{template.name}</span>
                  </label>
                );
              })}
              {templateOptions.length === 0 && (
                <p className="text-sm text-secondary">No active log templates available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2" style={{ marginBottom: 'var(--spacing-6)', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('weekly-status')}
          className={`btn ${activeTab === 'weekly-status' ? 'btn-primary' : 'btn-outline'}`}
        >
          <BarChart3 size={16} style={{ marginRight: 'var(--spacing-2)' }} />
          Weekly Status
        </button>
        <button
          onClick={() => setActiveTab('meals')}
          className={`btn ${activeTab === 'meals' ? 'btn-primary' : 'btn-outline'}`}
        >
          <DollarSign size={16} style={{ marginRight: 'var(--spacing-2)' }} />
          Reimbursable Meals
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`btn ${activeTab === 'compliance' ? 'btn-primary' : 'btn-outline'}`}
        >
          <AlertTriangle size={16} style={{ marginRight: 'var(--spacing-2)' }} />
          Compliance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
        >
          <FileText size={16} style={{ marginRight: 'var(--spacing-2)' }} />
          Log History
        </button>
      </div>

      {/* Report content */}
      <div className="card-lg">
        {activeTab === 'weekly-status' && renderWeeklyStatus()}
        {activeTab === 'meals' && renderMealsReport()}
        {activeTab === 'compliance' && renderComplianceSummary()}
        {activeTab === 'history' && renderLogHistory()}
      </div>
    </div>
  );
};

export default LogReportsView;
