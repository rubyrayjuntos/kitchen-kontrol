import React, { useState } from 'react';
import { Calendar, UserX, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react';
import useStore from '../../store';

const Absences = () => {
  const { absentees, users } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const getStatusIcon = (absence) => {
    if (absence.approved === null || absence.approved === false) {
      return <AlertCircle size={18} className="text-warning" />;
    }
    if (absence.approved) {
      return <CheckCircle size={18} className="text-success" />;
    }
    // Unexcused
    return <XCircle size={18} className="text-error" />;
  };

  const getStatusClass = (absence) => {
    if (absence.approved === null || absence.approved === false) {
      return 'warning';
    }
    if (absence.approved) {
      return 'success';
    }
    return 'error';
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <section className="neumorphic-raised" style={{ padding: 'var(--spacing-6)' }}>
      <div className="d-flex items-center justify-between mb-4">
        <div className="d-flex items-center gap-3">
          <UserX size={24} className="text-accent" />
          <h2 className="text-2xl font-bold text-neumorphic-embossed">
            Not Working
          </h2>
        </div>
        <button 
          className="btn btn-primary btn-circular"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-label="Add absence"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {(absentees && absentees.length > 0) ? (
          absentees.map((absence) => {
            const user = users?.find(u => u.id === absence.user_id);
            const status = getStatusClass(absence);
            
            return (
              <div 
                key={absence.id} 
                className="neumorphic-inset" 
                style={{ 
                  padding: 'var(--spacing-4)', 
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid var(--color-${status})`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="d-flex items-center justify-between">
                  <div className="d-flex items-center gap-3">
                    {getStatusIcon(absence)}
                    <div>
                      <div className="font-semibold text-base">
                        {user?.name || 'Unknown User'}
                        {isToday(absence.start_date) && (
                          <span className="text-accent" style={{ marginLeft: 'var(--spacing-2)' }}>*</span>
                        )}
                      </div>
                      <div className="text-sm text-secondary">
                        <Calendar size={14} style={{ display: 'inline', marginRight: 'var(--spacing-1)' }} />
                        {absence.start_date}
                        {absence.end_date && absence.end_date !== absence.start_date && 
                          ` - ${absence.end_date}`
                        }
                      </div>
                      {absence.reason && (
                        <div className="text-xs text-secondary italic">{absence.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {!absence.approved && (
                      <button className="btn btn-success btn-sm">Approve</button>
                    )}
                    <button className="btn btn-error btn-sm">Unexcused</button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
            <UserX size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-3)' }} />
            <p>No absences scheduled</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="card-lg mt-4" style={{ padding: 'var(--spacing-4)' }}>
          <h3 className="text-lg font-bold mb-4">Add Absence</h3>
          {/* Form fields will go here */}
          <p className="text-sm text-secondary">Form implementation needed</p>
        </div>
      )}
    </section>
  );
};

export default Absences;