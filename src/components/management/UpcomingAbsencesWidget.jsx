import React, { useState } from 'react';
import { CalendarX, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import useStore from '../../store';

const UpcomingAbsencesWidget = () => {
  const { absences = [], users = [], createAbsence, deleteAbsence, updateAbsenceApproval } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [newAbsence, setNewAbsence] = useState({ userId: '', date: '', reason: '' });
  const [decisionLoading, setDecisionLoading] = useState(false);

  const getUpcomingAbsences = () => {
    if (!Array.isArray(absences)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return absences
      .filter((absence) => {
        const dateValue = absence?.date || absence?.start_date || absence?.end_date;
        if (!dateValue) return false;
        const absenceDate = new Date(dateValue);
        if (Number.isNaN(absenceDate.getTime())) return false;
        return absenceDate >= today;
      })
      .sort((a, b) => {
        const aDate = new Date(a.date || a.start_date || a.end_date);
        const bDate = new Date(b.date || b.start_date || b.end_date);
        return aDate - bDate;
      })
      .slice(0, 10);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Unknown';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || user?.username || 'Unknown User';
  };

  const getStatusMeta = (approved) => {
    if (approved === true) {
      return {
        label: 'Approved',
        color: 'var(--color-success)',
        background: 'rgba(34, 197, 94, 0.15)',
      };
    }
    if (approved === false) {
      return {
        label: 'Not Approved',
        color: 'var(--color-error)',
        background: 'rgba(239, 68, 68, 0.15)',
      };
    }
    return {
      label: 'Pending Approval',
      color: 'var(--color-warning)',
      background: 'rgba(234, 179, 8, 0.18)',
    };
  };

  const handleApprovalDecision = async (absenceId, value) => {
    if (typeof updateAbsenceApproval !== 'function') return;

    try {
      setDecisionLoading(true);
      const result = await updateAbsenceApproval(absenceId, value);
      setSelectedAbsence((prev) => (
        prev && prev.id === absenceId
          ? { ...prev, approved: result.approved, approvalDate: result.approvalDate }
          : prev
      ));
    } catch (error) {
      console.error('Failed to update absence approval status:', error);
      alert('Unable to update approval status. Please try again.');
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleAddAbsence = async () => {
    if (!newAbsence.userId || !newAbsence.date || !newAbsence.reason) {
      alert('Please fill in all fields');
      return;
    }

    if (typeof createAbsence === 'function') {
      await createAbsence({
        user_id: parseInt(newAbsence.userId, 10),
        start_date: newAbsence.date,
        end_date: newAbsence.date,
        reason: newAbsence.reason,
      });
    }

    setNewAbsence({ userId: '', date: '', reason: '' });
    setShowAddModal(false);
  };

  const handleDeleteAbsence = async (absenceId) => {
    if (!window.confirm('Delete this absence record?')) {
      return;
    }

    if (typeof deleteAbsence === 'function') {
      await deleteAbsence(absenceId);
    }

    if (showEditModal) {
      setShowEditModal(false);
      setSelectedAbsence(null);
    }
  };

  const upcomingAbsences = getUpcomingAbsences();

  return (
    <section className="card-lg" style={{ height: '100%' }}>
      <div className="d-flex items-center justify-between mb-4">
        <div className="d-flex items-center gap-3">
          <CalendarX size={24} className="text-accent" />
          <h2 className="text-xl font-bold text-neumorphic-embossed">Upcoming Absences</h2>
        </div>
        <button
          className="btn btn-accent btn-sm"
          onClick={() => setShowAddModal(true)}
          aria-label="Add absence"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>

      <div
        className="neumorphic-inset"
        style={{
          padding: 'var(--spacing-4)',
          maxHeight: '400px',
          overflowY: 'auto',
          background: 'var(--bg-elevated)',
        }}
      >
        {upcomingAbsences.length === 0 ? (
          <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
            No upcoming absences scheduled.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {upcomingAbsences.map((absence) => {
              const badgeStatus = getStatusMeta(absence.approved);
              return (
                <div
                  key={absence.id}
                  className="neumorphic-raised"
                  style={{ padding: 'var(--spacing-3)', transition: 'all 0.2s ease' }}
                >
                  <div className="d-flex items-start justify-between">
                    <div style={{ flex: 1 }}>
                      <div className="mb-2">
                        <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                          {formatDate(absence.date || absence.start_date)}
                        </span>
                      </div>

                      <h4 className="font-semibold mb-1" style={{ fontSize: '0.95rem' }}>
                        {getUserName(absence.user_id)}
                      </h4>

                      <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {absence.reason}
                      </div>

                      <div style={{ marginTop: 'var(--spacing-2)' }}>
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.75rem',
                            color: badgeStatus.color,
                            background: badgeStatus.background,
                            border: `1px solid ${badgeStatus.color}`,
                          }}
                        >
                          {badgeStatus.label}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circular"
                        onClick={() => {
                          setSelectedAbsence(absence);
                          setShowEditModal(true);
                        }}
                        aria-label="View details"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circular"
                        onClick={() => handleDeleteAbsence(absence.id)}
                        aria-label="Delete absence"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Absence">
          <div className="form-group">
            <label className="form-label">User</label>
            <select
              className="form-control"
              value={newAbsence.userId}
              onChange={(e) => setNewAbsence({ ...newAbsence, userId: e.target.value })}
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={newAbsence.date}
              onChange={(e) => setNewAbsence({ ...newAbsence, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              className="form-control"
              value={newAbsence.reason}
              onChange={(e) => setNewAbsence({ ...newAbsence, reason: e.target.value })}
              rows="3"
              placeholder="Sick leave, vacation, etc."
            />
          </div>

          <div className="d-flex gap-3 justify-end">
            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-accent" onClick={handleAddAbsence}>
              Add Absence
            </button>
          </div>
        </Modal>
      )}

      {showEditModal && selectedAbsence && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAbsence(null);
          }}
          title="Absence Details"
        >
          <div className="mb-4 d-flex flex-column gap-3">
            <div className="form-group">
              <label className="form-label">User</label>
              <div className="form-control" style={{ background: 'var(--bg-secondary)' }}>
                {getUserName(selectedAbsence.user_id)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="form-control" style={{ background: 'var(--bg-secondary)' }}>
                {(() => {
                  const rawDate =
                    selectedAbsence.date || selectedAbsence.start_date || selectedAbsence.end_date;
                  return new Date(rawDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                })()}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <div className="form-control" style={{ background: 'var(--bg-secondary)', minHeight: '80px' }}>
                {selectedAbsence.reason || '—'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              {(() => {
                const status = getStatusMeta(selectedAbsence.approved);
                return (
                  <div
                    className="form-control"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: status.color,
                      border: `1px solid ${status.color}`,
                      fontWeight: 600,
                    }}
                  >
                    {status.label}
                  </div>
                );
              })()}
            </div>

            {selectedAbsence.approvalDate && (
              <div className="form-group">
                <label className="form-label">Last Decision</label>
                <div className="form-control" style={{ background: 'var(--bg-secondary)' }}>
                  {new Date(selectedAbsence.approvalDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                onClick={() => handleApprovalDecision(selectedAbsence.id, true)}
                disabled={decisionLoading || selectedAbsence.approved === true}
              >
                {decisionLoading && selectedAbsence.approved !== true ? 'Saving…' : 'Approve'}
              </button>
              <button
                className="btn btn-warning"
                onClick={() => handleApprovalDecision(selectedAbsence.id, null)}
                disabled={decisionLoading || selectedAbsence.approved === null}
              >
                {decisionLoading && selectedAbsence.approved !== null ? 'Saving…' : 'Mark Pending'}
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleApprovalDecision(selectedAbsence.id, false)}
                disabled={decisionLoading || selectedAbsence.approved === false}
              >
                {decisionLoading && selectedAbsence.approved !== false ? 'Saving…' : 'Decline'}
              </button>
            </div>

            <div className="d-flex gap-2 justify-end">
              <button className="btn btn-error" onClick={() => handleDeleteAbsence(selectedAbsence.id)}>
                <Trash2 size={16} />
                Delete
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAbsence(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default UpcomingAbsencesWidget;
