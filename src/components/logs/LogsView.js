import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, RefreshCw, Plus, ClipboardList } from 'lucide-react';
import useStore from '../../store';
import FormRenderer from '../forms/FormRenderer';
import { apiRequest } from '../../utils/api';
import Modal from '../common/Modal';
import LogAssignmentWidget from './LogAssignmentWidget';
import './LogsView.css';

const LogsView = () => {
  const { user } = useStore();
  const [assignments, setAssignments] = useState([]);
  const [adminAssignments, setAdminAssignments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateDetail, setTemplateDetail] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [quickLogSubmitting, setQuickLogSubmitting] = useState(false);

  const isAdmin = useMemo(() => user?.permissions === 'admin', [user?.permissions]);

  const fetchAssignments = useCallback(async () => {
    if (!user?.token) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isAdmin) {
        const [allAssignments, templateList] = await Promise.all([
          apiRequest('/api/logs/assignments?active_only=true', user.token),
          apiRequest('/api/logs/templates', user.token),
        ]);
        setAdminAssignments(Array.isArray(allAssignments) ? allAssignments : []);
        setTemplates(Array.isArray(templateList) ? templateList : []);
        setAssignments([]);
      } else {
        const data = await apiRequest('/api/logs/assignments/me', user.token);
        setAssignments(Array.isArray(data) ? data : []);
        setAdminAssignments([]);
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [user?.token, isAdmin]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openTemplateModal = useCallback(async (templateId) => {
    if (!user?.token) {
      return;
    }

    const baseTemplate = templates.find((tpl) => tpl.id === templateId) || null;
    setTemplateDetail(baseTemplate);
    setTemplateError(null);
    setQuickLogVisible(false);
    setShowTemplateModal(true);

    if (baseTemplate?.form_schema) {
      return;
    }

    try {
      setTemplateLoading(true);
      const detail = await apiRequest(`/api/logs/templates/${templateId}`, user.token);
      setTemplateDetail((prev) => (prev ? { ...prev, ...detail } : detail));
    } catch (err) {
      console.error('Failed to load template', err);
      setTemplateError(err.message || 'Unable to load template details.');
    } finally {
      setTemplateLoading(false);
    }
  }, [templates, user?.token]);

  const closeTemplateModal = useCallback(() => {
    setShowTemplateModal(false);
    setTemplateDetail(null);
    setTemplateError(null);
    setQuickLogVisible(false);
    setQuickLogSubmitting(false);
  }, []);

  const templateAssignments = useMemo(() => {
    if (!templateDetail) return [];
    return adminAssignments.filter((assignment) => assignment.log_template_id === templateDetail.id);
  }, [templateDetail, adminAssignments]);

  const handleQuickLogSubmit = useCallback(async (formData) => {
    if (!templateDetail || !user?.token) {
      return;
    }

    try {
      setQuickLogSubmitting(true);
      await apiRequest('/api/logs/submissions', user.token, {
        method: 'POST',
        body: JSON.stringify({
          log_template_id: templateDetail.id,
          form_data: formData,
          log_assignment_id: null
        })
      });

      await fetchAssignments();
      setQuickLogVisible(false);
      alert('✅ Quick log submitted successfully.');
    } catch (err) {
      console.error('Quick log submission failed', err);
      alert(`❌ Quick log submission failed: ${err.message}`);
    } finally {
      setQuickLogSubmitting(false);
    }
  }, [templateDetail, user?.token, fetchAssignments]);

  const handleSubmit = async (formData) => {
    if (!selectedAssignment) return;

    try {
      setSubmitting(true);

      await apiRequest('/api/logs/submissions', user.token, {
        method: 'POST',
        body: JSON.stringify({
          log_template_id: selectedAssignment.template_id,
          form_data: formData,
        }),
      });

      await fetchAssignments();
      setSelectedAssignment(null);
      alert('✅ Log submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      alert(`❌ Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-6)' }}>
        <div className="d-flex flex-column items-center justify-center" style={{ minHeight: '400px' }}>
          <RefreshCw className="text-accent" size={48} />
          <p className="text-secondary" style={{ marginTop: 'var(--spacing-4)' }}>
            Loading your log assignments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--spacing-6)' }}>
        <div className="card-lg">
          <div className="d-flex items-center gap-3" style={{ color: 'var(--color-error)' }}>
            <AlertCircle size={32} />
            <div>
              <h3 className="font-semibold text-lg">Error Loading Assignments</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button onClick={fetchAssignments} className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>
            <RefreshCw size={16} style={{ marginRight: 'var(--spacing-2)' }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin && assignments.length === 0) {
    return (
      <div style={{ padding: 'var(--spacing-6)' }}>
        <div className="card-lg text-center">
          <AlertCircle className="text-warning mx-auto" size={64} />
          <h3 className="font-semibold text-xl" style={{ marginTop: 'var(--spacing-4)' }}>
            No Log Assignments
          </h3>
          <p className="text-secondary" style={{ marginTop: 'var(--spacing-2)' }}>
            You don't have any log assignments for today.
          </p>
        </div>
      </div>
    );
  }

  const renderAssignmentTarget = (assignment) => {
    if (assignment.user_name) {
      return `User: ${assignment.user_name}`;
    }
    if (assignment.role_name) {
      return `Role: ${assignment.role_name}`;
    }
    if (assignment.phase_name) {
      return `Phase: ${assignment.phase_name}`;
    }
    return 'Unassigned';
  };

  const renderDays = (days) => {
    if (!days || days.trim().toLowerCase() === 'all') {
      return 'All days';
    }
    return days
      .split(',')
      .map((day) => day.trim().substring(0, 3).toUpperCase())
      .join(' • ');
  };

  if (isAdmin) {
    return (
      <div className="logs-manager">
        <div className="logs-header">
          <div>
            <h1 className="text-2xl font-bold logs-title">Log Assignment Manager</h1>
            <p className="logs-subtitle">
              {adminAssignments.length} active assignment{adminAssignments.length === 1 ? '' : 's'} across {templates.length} log template{templates.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button onClick={fetchAssignments} className="logs-refresh-btn" title="Refresh assignments">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="btn btn-accent" onClick={() => setShowAssignmentModal(true)}>
              <Plus size={18} style={{ marginRight: 'var(--spacing-2)' }} />
              New Assignment
            </button>
          </div>
        </div>

        <div className="logs-help-card">
          <strong>How to work with logs</strong>
          <ul>
            <li>Click any <em>Active Log Template</em> card to review its details and open the Quick Log form.</li>
            <li>Quick Log lets you record today’s entry immediately—useful for supervisors or catching up, even if no assignment exists.</li>
            <li>The list below shows every active assignment, who owns it, the due window, and the days it repeats.</li>
          </ul>
        </div>

        <div className="logs-section-card">
          <div className="d-flex items-center gap-2">
            <ClipboardList size={20} className="text-accent" />
            <h3 className="font-semibold text-lg logs-title" style={{ color: '#0f172a' }}>Active Log Templates</h3>
          </div>
          {templates.length === 0 ? (
            <p className="logs-subtitle">No templates available.</p>
          ) : (
            <div className="logs-template-grid">
              {templates.map((template) => {
                const assignmentCount = adminAssignments.filter((assignment) => assignment.log_template_id === template.id).length;
                return (
                  <button
                    key={template.id}
                    type="button"
                    className="logs-template-card"
                    onClick={() => openTemplateModal(template.id)}
                    aria-label={`Open ${template.name} template details`}
                  >
                    <span className="logs-template-card__category">
                      {template.category?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'General'}
                    </span>
                    <span className="logs-template-card__name">{template.name}</span>
                    <span className="logs-template-card__meta">
                      {assignmentCount} assignment{assignmentCount === 1 ? '' : 's'} • {template.frequency || 'adhoc'}
                    </span>
                    <span className="logs-template-card__cta">View details & Quick Log →</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {adminAssignments.length === 0 ? (
          <div className="logs-empty-card">
            <AlertCircle className="text-warning" size={48} style={{ marginBottom: '0.75rem' }} />
            <h3 className="font-semibold text-xl" style={{ margin: 0 }}>No Active Log Assignments</h3>
            <p style={{ marginTop: '0.5rem' }}>Create an assignment to get started.</p>
          </div>
        ) : (
          <div className="logs-section-card">
            <h3 className="font-semibold text-lg logs-title" style={{ color: '#0f172a' }}>Active Assignments</h3>
            <div className="logs-assignment-grid">
              {adminAssignments.map((assignment) => (
                <div key={assignment.id} className="logs-assignment-card">
                  <h4 className="logs-assignment-card__title">{assignment.template_name}</h4>
                  <p className="logs-assignment-card__line">{renderAssignmentTarget(assignment)}</p>
                  <p className="logs-assignment-card__line">Due: {assignment.due_time || 'Flexible'}</p>
                  <p className="logs-assignment-card__line">Days: {renderDays(assignment.days_of_week || 'All')}</p>
                  <span className={`logs-status-pill ${assignment.is_active ? 'success' : 'warning'}`}>
                    {assignment.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAssignmentModal && (
          <Modal
            isOpen={showAssignmentModal}
            onClose={() => setShowAssignmentModal(false)}
            title="Create Log Assignment"
          >
            <LogAssignmentWidget
              onClose={() => setShowAssignmentModal(false)}
              onSuccess={() => {
                setShowAssignmentModal(false);
                fetchAssignments();
              }}
            />
          </Modal>
        )}

        {showTemplateModal && (
          <Modal
            isOpen={showTemplateModal}
            onClose={closeTemplateModal}
            title={templateDetail?.name || 'Log Template'}
          >
            {templateLoading ? (
              <div className="d-flex flex-column items-center justify-center" style={{ padding: 'var(--spacing-6)' }}>
                <RefreshCw className="text-accent spin" size={32} />
                <p className="text-secondary" style={{ marginTop: 'var(--spacing-3)' }}>Loading template details…</p>
              </div>
            ) : templateError ? (
              <div className="text-center" style={{ padding: 'var(--spacing-4)', color: 'var(--color-error)' }}>
                {templateError}
              </div>
            ) : templateDetail ? (
              <div className="logs-modal-section" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div>
                  <div className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-1)' }}>
                    {templateDetail.category?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'General'}
                  </div>
                  <h3 className="font-semibold text-lg" style={{ marginBottom: 'var(--spacing-1)' }}>{templateDetail.name}</h3>
                  {templateDetail.description && (
                    <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>{templateDetail.description}</p>
                  )}
                  <p className="text-xs text-secondary" style={{ marginTop: 'var(--spacing-2)' }}>
                    Frequency: {templateDetail.frequency || 'unspecified'}
                  </p>
                </div>

                <div className="logs-quick-log-panel">
                  <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-3)' }}>
                    <h4 className="font-semibold text-base">Quick Log</h4>
                    {templateDetail.form_schema && !quickLogVisible && (
                      <button className="btn btn-primary" onClick={() => setQuickLogVisible(true)}>
                        Open Quick Log
                      </button>
                    )}
                  </div>
                  {!templateDetail.form_schema && (
                    <p className="text-secondary text-sm">
                      This template does not provide a form schema. Configure the template to enable quick logging.
                    </p>
                  )}
                  {templateDetail.form_schema && !quickLogVisible && (
                    <p className="text-secondary text-sm">
                      Submit a log entry immediately—no assignment required. Useful for catch-up entries or supervisor walkthroughs.
                    </p>
                  )}
                  {quickLogVisible && templateDetail.form_schema && (
                    <FormRenderer
                      schema={templateDetail.form_schema}
                      uiSchema={templateDetail.ui_schema || {}}
                      defaultValues={{}}
                      onSubmit={handleQuickLogSubmit}
                      onCancel={() => setQuickLogVisible(false)}
                      submitLabel="Submit Quick Log"
                      loading={quickLogSubmitting}
                    />
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-base" style={{ marginBottom: 'var(--spacing-2)' }}>Assignments</h4>
                  {templateAssignments.length === 0 ? (
                    <p className="text-secondary text-sm">No active assignments for this template.</p>
                  ) : (
                    <div className="logs-modal-assignments">
                      {templateAssignments.map((assignment) => (
                        <div key={assignment.id} className="logs-assignment-card" style={{ boxShadow: '0 10px 20px rgba(15,23,42,0.12)' }}>
                          <div className="font-semibold text-sm" style={{ marginBottom: 'var(--spacing-1)' }}>
                            {assignment.template_name}
                          </div>
                          <div className="text-xs text-secondary" style={{ marginBottom: 'var(--spacing-1)' }}>
                            {renderAssignmentTarget(assignment)}
                          </div>
                          <div className="text-xs text-secondary" style={{ marginBottom: 'var(--spacing-1)' }}>
                            Due: {assignment.due_time || 'Flexible'}
                          </div>
                          <div className="text-xs text-secondary">
                            Days: {renderDays(assignment.days_of_week || 'All')} • Status: {assignment.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </Modal>
        )}
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <div style={{ padding: 'var(--spacing-6)' }}>
        <div className="card-lg">
          <FormRenderer
            schema={selectedAssignment.form_schema}
            uiSchema={selectedAssignment.ui_schema || {}}
            defaultValues={selectedAssignment.submission?.form_data || {}}
            onSubmit={handleSubmit}
            onCancel={() => setSelectedAssignment(null)}
            submitLabel={selectedAssignment.is_completed ? 'Update Log' : 'Submit Log'}
            loading={submitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="logs-manager">
      <div className="logs-header">
        <div>
          <h1 className="text-2xl font-bold logs-title">Daily Logs</h1>
          <p className="logs-subtitle">
            {assignments.length} {assignments.length === 1 ? 'log' : 'logs'} assigned to you today
          </p>
        </div>
        <button onClick={fetchAssignments} className="logs-refresh-btn" title="Refresh">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="logs-help-card">
        <strong>Staying on track</strong>
        <ul>
          <li>Select a log to fill it out or review what you already submitted.</li>
          <li>Green badge means you are done for today; yellow means still outstanding.</li>
        </ul>
      </div>

      <div className="logs-assignment-grid">
        {assignments.map((assignment) => {
          const isComplete = Boolean(assignment.is_completed);
          return (
            <div key={assignment.assignment_id} className="logs-user-card">
              <div className="d-flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg" style={{ margin: 0 }}>{assignment.template_name}</h3>
                  <p className="logs-subtitle" style={{ marginTop: '0.25rem' }}>{assignment.category}</p>
                  {assignment.due_time && (
                    <p className="logs-assignment-card__line" style={{ marginTop: '0.35rem' }}>
                      Due: {assignment.due_time}
                    </p>
                  )}
                </div>
                <span className={`logs-status-pill ${isComplete ? 'success' : 'warning'}`}>
                  {isComplete ? 'Completed' : 'Needs attention'}
                </span>
              </div>

              {isComplete && assignment.submission && (
                <div className="logs-quick-log-panel" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(22,163,74,0.3)' }}>
                  <div style={{ fontWeight: 600, color: '#15803d' }}>✓ Submitted</div>
                  <div className="logs-assignment-card__line" style={{ marginTop: '0.35rem' }}>
                    {new Date(assignment.submission.submitted_at).toLocaleString()}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedAssignment(assignment)}
                className={`btn ${isComplete ? 'btn-outline' : 'btn-primary'}`}
                style={{ width: '100%', fontWeight: 600 }}
              >
                {isComplete ? 'View / Edit Submission' : 'Complete Log'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogsView;
