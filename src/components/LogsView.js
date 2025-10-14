import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import useStore from '../store';
import FormRenderer from './FormRenderer';
import { apiRequest } from '../utils/api';

const LogsView = () => {
  const { user } = useStore();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!user?.token) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest('/api/logs/assignments/me', user.token);
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

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

  if (assignments.length === 0) {
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
    <div style={{ padding: 'var(--spacing-6)' }}>
      <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 className="text-2xl font-bold text-neumorphic-embossed">Daily Logs</h1>
          <p className="text-secondary" style={{ marginTop: 'var(--spacing-1)' }}>
            {assignments.length} {assignments.length === 1 ? 'log' : 'logs'} assigned to you today
          </p>
        </div>
        <button onClick={fetchAssignments} className="btn btn-ghost" title="Refresh">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="demo-grid">
        {assignments.map((assignment) => (
          <div key={assignment.assignment_id} className="neumorphic-raised" style={{ padding: 'var(--spacing-6)' }}>
            <div className="d-flex items-start justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ flex: 1 }}>
                <h3 className="font-semibold text-lg">{assignment.template_name}</h3>
                <p className="text-secondary text-sm" style={{ marginTop: 'var(--spacing-1)' }}>
                  {assignment.category}
                </p>
                {assignment.due_time && (
                  <p className="text-xs text-secondary" style={{ marginTop: 'var(--spacing-1)' }}>
                    Due: {assignment.due_time}
                  </p>
                )}
              </div>
              {assignment.is_completed ? (
                <CheckCircle2 className="text-success" size={28} />
              ) : (
                <AlertCircle className="text-warning" size={28} />
              )}
            </div>

            {assignment.is_completed && assignment.submission && (
              <div className="neumorphic-inset" style={{ padding: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                <div className="text-success font-medium">✓ Completed</div>
                <div className="text-secondary text-xs" style={{ marginTop: 'var(--spacing-1)' }}>
                  Submitted {new Date(assignment.submission.submitted_at).toLocaleString()}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedAssignment(assignment)}
              className={`btn ${assignment.is_completed ? 'btn-outline' : 'btn-primary'}`}
              style={{ width: '100%', fontWeight: '500' }}
            >
              {assignment.is_completed ? 'View/Edit Log' : 'Complete Log'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsView;
