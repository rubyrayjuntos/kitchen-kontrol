import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Clock, Users, UserCheck, Briefcase } from 'lucide-react';
import useStore from '../../store';
import { apiRequest } from '../../utils/api';

/**
 * LogAssignmentWidget - Admin interface for creating log assignments
 * 
 * Allows admins to:
 * - Select which log template to assign
 * - Choose assignment target (User, Role, or Phase)
 * - Set due time
 * - Select days of week
 */
const LogAssignmentWidget = ({ onClose, onSuccess }) => {
  const { user } = useStore();
  
  // Form state
  const [templateId, setTemplateId] = useState('');
  const [assignmentType, setAssignmentType] = useState('user'); // 'user', 'role', 'phase'
  const [targetId, setTargetId] = useState('');
  const [dueTime, setDueTime] = useState('08:00');
  const [daysOfWeek, setDaysOfWeek] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  
  // Data from API
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [phases, setPhases] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [templatesData, usersData, rolesData, phasesData] = await Promise.all([
          apiRequest('/api/logs/templates', user.token),
          apiRequest('/api/users', user.token),
          apiRequest('/api/roles', user.token),
          apiRequest('/api/phases', user.token),
        ]);
        
        setTemplates(Array.isArray(templatesData) ? templatesData : []);
        setUsers(Array.isArray(usersData?.data) ? usersData.data : []);
        setRoles(Array.isArray(rolesData?.data) ? rolesData.data : []);
        setPhases(Array.isArray(phasesData?.data) ? phasesData.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    }
  }, [user?.token]);

  const toggleDay = (day) => {
    setDaysOfWeek(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!templateId) {
      alert('Please select a log template');
      return;
    }
    
    if (!targetId) {
      alert(`Please select a ${assignmentType}`);
      return;
    }
    
    const selectedDays = Object.entries(daysOfWeek)
      .filter(([_, selected]) => selected)
      .map(([day]) => day.substring(0, 3).charAt(0).toUpperCase() + day.substring(1, 3));
    
    if (selectedDays.length === 0) {
      alert('Please select at least one day of the week');
      return;
    }

    try {
      setSubmitting(true);
      
      // Build request body based on assignment type
      const requestBody = {
        log_template_id: parseInt(templateId, 10),
        due_time: dueTime ? `${dueTime}:00` : null,
        days_of_week: selectedDays.join(','),
      };
      
      // Add the appropriate target field
      if (assignmentType === 'user') {
        requestBody.user_id = parseInt(targetId, 10);
      } else if (assignmentType === 'role') {
        requestBody.role_id = parseInt(targetId, 10);
      } else if (assignmentType === 'phase') {
        requestBody.phase_id = targetId;
      }

      const result = await apiRequest('/api/logs/assignments', user.token, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log('Assignment created:', result);
      alert('✅ Log assignment created successfully!');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert(`❌ Failed to create assignment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card-lg">
        <div className="d-flex items-center justify-center" style={{ padding: 'var(--spacing-8)' }}>
          <div className="text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-lg">
        <div style={{ color: 'var(--color-error)', padding: 'var(--spacing-4)' }}>
          Error loading data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card-lg">
      <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 className="text-xl font-bold text-neumorphic-embossed">Create Log Assignment</h2>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 'var(--spacing-2)' }}>
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Log Template Selection */}
        <div className="form-field">
          <label className="form-label">
            <Calendar size={16} style={{ marginRight: 'var(--spacing-2)' }} />
            Log Template *
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="neumorphic-input"
            required
          >
            <option value="">-- Select Log Template --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.category})
              </option>
            ))}
          </select>
          <p className="text-xs text-secondary" style={{ marginTop: 'var(--spacing-1)' }}>
            Choose which log form to assign
          </p>
        </div>

        {/* Assignment Type */}
        <div className="form-field">
          <label className="form-label">Assignment Target Type *</label>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAssignmentType('user');
                setTargetId('');
              }}
              className={`btn ${assignmentType === 'user' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1 }}
            >
              <UserCheck size={16} style={{ marginRight: 'var(--spacing-2)' }} />
              User
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignmentType('role');
                setTargetId('');
              }}
              className={`btn ${assignmentType === 'role' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1 }}
            >
              <Users size={16} style={{ marginRight: 'var(--spacing-2)' }} />
              Role
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignmentType('phase');
                setTargetId('');
              }}
              className={`btn ${assignmentType === 'phase' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1 }}
            >
              <Briefcase size={16} style={{ marginRight: 'var(--spacing-2)' }} />
              Phase
            </button>
          </div>
          <p className="text-xs text-secondary" style={{ marginTop: 'var(--spacing-1)' }}>
            Assign to a specific user, all users in a role, or all users in a phase
          </p>
        </div>

        {/* Target Selection */}
        <div className="form-field">
          <label className="form-label">
            {assignmentType === 'user' && 'Select User'}
            {assignmentType === 'role' && 'Select Role'}
            {assignmentType === 'phase' && 'Select Phase'}
            {' *'}
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="neumorphic-input"
            required
          >
            <option value="">
              -- Select {assignmentType === 'user' ? 'User' : assignmentType === 'role' ? 'Role' : 'Phase'} --
            </option>
            {assignmentType === 'user' && users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
            {assignmentType === 'role' && roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
            {assignmentType === 'phase' && phases.map((p) => (
              <option key={p.id} value={p.id}>
                {(p.title || p.name || p.id)}{p.time ? ` (${p.time})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Due Time */}
        <div className="form-field">
          <label className="form-label">
            <Clock size={16} style={{ marginRight: 'var(--spacing-2)' }} />
            Due Time *
          </label>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="neumorphic-input"
            required
          />
          <p className="text-xs text-secondary" style={{ marginTop: 'var(--spacing-1)' }}>
            What time should this log be completed by?
          </p>
        </div>

        {/* Days of Week */}
        <div className="form-field">
          <label className="form-label">Days of Week *</label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 'var(--spacing-2)' 
          }}>
            {Object.entries(daysOfWeek).map(([day, selected]) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`btn ${selected ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  padding: 'var(--spacing-2)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: selected ? '600' : '400'
                }}
              >
                {day.substring(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-secondary" style={{ marginTop: 'var(--spacing-1)' }}>
            Select which days this assignment applies to
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3" style={{ marginTop: 'var(--spacing-6)' }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            <Save size={16} style={{ marginRight: 'var(--spacing-2)' }} />
            {submitting ? 'Creating...' : 'Create Assignment'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-outline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LogAssignmentWidget;
