import React, { useState } from 'react';
import { CalendarX, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from './Modal';
import useStore from '../store';

const UpcomingAbsencesWidget = () => {
  const { absences, users, createAbsence, deleteAbsence } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [newAbsence, setNewAbsence] = useState({
    userId: '',
    date: '',
    reason: ''
  });

  // Get upcoming absences (today and future)
  const getUpcomingAbsences = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return absences
      .filter(absence => {
        const absenceDate = new Date(absence.date);
        return absenceDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10); // Show next 10 absences
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.username || 'Unknown User';
  };

  // Handle add absence
  const handleAddAbsence = async () => {
    if (!newAbsence.userId || !newAbsence.date || !newAbsence.reason) {
      alert('Please fill in all fields');
      return;
    }

    await createAbsence({
      user_id: parseInt(newAbsence.userId),
      date: newAbsence.date,
      reason: newAbsence.reason,
      status: 'approved'
    });

    setNewAbsence({ userId: '', date: '', reason: '' });
    setShowAddModal(false);
  };

  // Handle delete absence
  const handleDeleteAbsence = async (absenceId) => {
    if (window.confirm('Delete this absence record?')) {
      await deleteAbsence(absenceId);
      if (showEditModal) {
        setShowEditModal(false);
        setSelectedAbsence(null);
      }
    }
  };

  const upcomingAbsences = getUpcomingAbsences();

  return (
    <section className="card-lg" style={{ height: '100%' }}>
      {/* Header */}
      <div className="d-flex items-center justify-between mb-4">
        <div className="d-flex items-center gap-3">
          <CalendarX size={24} className="text-accent" />
          <h2 className="text-xl font-bold text-neumorphic-embossed">
            Upcoming Absences
          </h2>
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

      {/* Absences List */}
      <div className="neumorphic-inset" style={{ 
        padding: 'var(--spacing-4)', 
        maxHeight: '400px', 
        overflowY: 'auto',
        background: 'var(--bg-elevated)'
      }}>
        {upcomingAbsences.length === 0 ? (
          <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
            No upcoming absences scheduled.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {upcomingAbsences.map(absence => (
              <div
                key={absence.id}
                className="neumorphic-raised"
                style={{
                  padding: 'var(--spacing-3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="d-flex items-start justify-between">
                  <div style={{ flex: 1 }}>
                    {/* Date Badge */}
                    <div className="mb-2">
                      <span 
                        className="badge badge-accent" 
                        style={{ fontSize: '0.75rem' }}
                      >
                        {formatDate(absence.date)}
                      </span>
                    </div>

                    {/* User Name */}
                    <h4 className="font-semibold mb-1" style={{ fontSize: '0.95rem' }}>
                      {getUserName(absence.user_id)}
                    </h4>

                    {/* Reason */}
                    <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      {absence.reason}
                    </div>
                  </div>

                  {/* Actions */}
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
            ))}
          </div>
        )}
      </div>

      {/* Add Absence Modal */}
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
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
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

      {/* Edit/View Absence Modal */}
      {showEditModal && selectedAbsence && (
        <Modal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAbsence(null);
          }} 
          title="Absence Details"
        >
          <div className="mb-4">
            <div className="form-group">
              <label className="form-label">User</label>
              <div className="form-control" style={{ background: 'var(--bg-secondary)' }}>
                {getUserName(selectedAbsence.user_id)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="form-control" style={{ background: 'var(--bg-secondary)' }}>
                {new Date(selectedAbsence.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <div className="form-control" style={{ background: 'var(--bg-secondary)', minHeight: '80px' }}>
                {selectedAbsence.reason}
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 justify-end">
            <button 
              className="btn btn-error" 
              onClick={() => handleDeleteAbsence(selectedAbsence.id)}
            >
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
        </Modal>
      )}
    </section>
  );
};

export default UpcomingAbsencesWidget;
