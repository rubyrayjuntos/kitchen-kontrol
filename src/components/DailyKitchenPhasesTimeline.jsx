import React, { useState, useEffect, useRef } from 'react';
import { Clock, Pencil, Plus, ChevronLeft, ChevronRight, Trash2, Users, CheckSquare } from 'lucide-react';
import Modal from './Modal';
import useStore from '../store';

const DailyKitchenPhasesTimeline = () => {
  const { scheduleData, createPhase, deletePhase, tasks, users, rolePhases } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [newPhase, setNewPhase] = useState({ name: '', startTime: '08:00' });
  const [carouselOffset, setCarouselOffset] = useState(0);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  // Constants
  const TIMELINE_START_HOUR = 7; // 7 AM
  const TIMELINE_END_HOUR = 15; // 3 PM
  const TIMELINE_DURATION_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60; // 480 minutes
  const MIN_PHASE_WIDTH = 80; // pixels

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Parse phases from scheduleData
  const phases = scheduleData.phases ? Object.entries(scheduleData.phases)
    .map(([id, phase]) => ({
      id,
      name: phase.title || phase.name,
      startTime: phase.time,
      ...phase
    }))
    .sort((a, b) => {
      const timeA = parseTime(a.startTime);
      const timeB = parseTime(b.startTime);
      return timeA - timeB;
    }) : [];

  // Helper: Parse time string to minutes since midnight
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper: Format minutes to time string
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Helper: Check if current time is within phase
  const isCurrentPhase = (phase, nextPhase) => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const phaseStart = parseTime(phase.startTime);
    const phaseEnd = nextPhase ? parseTime(nextPhase.startTime) : TIMELINE_END_HOUR * 60;
    return now >= phaseStart && now < phaseEnd;
  };

  // Helper: Check if workday status
  const getWorkdayStatus = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const timelineStart = TIMELINE_START_HOUR * 60;
    const timelineEnd = TIMELINE_END_HOUR * 60;

    if (now < timelineStart) {
      return 'before';
    } else if (now >= timelineEnd) {
      return 'after';
    }
    return 'during';
  };

  // Calculate phase width and position
  const calculatePhaseLayout = (phase, index, allPhases) => {
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const phaseStart = parseTime(phase.startTime);
    const nextPhase = allPhases[index + 1];
    const phaseEnd = nextPhase ? parseTime(nextPhase.startTime) : TIMELINE_END_HOUR * 60;
    const durationMinutes = phaseEnd - phaseStart;

    const pixelsPerMinute = containerWidth / TIMELINE_DURATION_MINUTES;
    const calculatedWidth = durationMinutes * pixelsPerMinute;
    const width = Math.max(calculatedWidth, MIN_PHASE_WIDTH);

    const startOffset = (phaseStart - TIMELINE_START_HOUR * 60) * pixelsPerMinute;

    return {
      width,
      left: startOffset,
      duration: durationMinutes,
      endTime: formatTime(phaseEnd)
    };
  };

  // Calculate NOW indicator position
  const calculateNowPosition = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const pixelsPerMinute = containerWidth / TIMELINE_DURATION_MINUTES;
    const offset = (now - TIMELINE_START_HOUR * 60) * pixelsPerMinute;
    return offset;
  };

  // Get tasks for a phase
  const getPhaseTasksGrouped = (phaseId) => {
    const phaseTasks = tasks.filter(task => task.phase_id === parseInt(phaseId));
    const grouped = {};

    phaseTasks.forEach(task => {
      const roleName = task.role_name || 'Unassigned';
      if (!grouped[roleName]) {
        grouped[roleName] = [];
      }
      grouped[roleName].push(task);
    });

    return grouped;
  };

  // Get task completion percentage for phase
  const getPhaseProgress = (phaseId) => {
    const phaseTasks = tasks.filter(task => task.phase_id === parseInt(phaseId));
    if (phaseTasks.length === 0) return 0;
    const completed = phaseTasks.filter(task => task.completed).length;
    return Math.round((completed / phaseTasks.length) * 100);
  };

  // Get assigned users count for phase
  const getPhaseUserCount = (phaseId) => {
    const phaseRoles = rolePhases.filter(rp => rp.phase_id === parseInt(phaseId));
    return phaseRoles.length;
  };

  // Handle add phase
  const handleAddPhase = async () => {
    if (!newPhase.name || !newPhase.startTime) return;

    // Validate time is within bounds
    const startMinutes = parseTime(newPhase.startTime);
    if (startMinutes < TIMELINE_START_HOUR * 60 || startMinutes >= TIMELINE_END_HOUR * 60) {
      alert(`Phase start time must be between ${TIMELINE_START_HOUR}:00 AM and ${TIMELINE_END_HOUR - 1}:59 PM`);
      return;
    }

    // Check for conflicts
    const conflict = phases.find(p => {
      const pStart = parseTime(p.startTime);
      return startMinutes === pStart;
    });

    if (conflict) {
      alert(`Conflict: Another phase "${conflict.name}" already starts at ${newPhase.startTime}`);
      return;
    }

    await createPhase({
      title: newPhase.name,
      time: newPhase.startTime,
      status: 'pending'
    });

    setNewPhase({ name: '', startTime: '08:00' });
    setShowAddModal(false);
  };

  // Handle edit phase
  const handleEditPhase = async () => {
    if (!selectedPhase) return;

    // Validate time
    const startMinutes = parseTime(selectedPhase.startTime);
    if (startMinutes < TIMELINE_START_HOUR * 60 || startMinutes >= TIMELINE_END_HOUR * 60) {
      alert(`Phase start time must be between ${TIMELINE_START_HOUR}:00 AM and ${TIMELINE_END_HOUR - 1}:59 PM`);
      return;
    }

    // Check for conflicts (excluding current phase)
    const conflict = phases.find(p => {
      if (p.id === selectedPhase.id) return false;
      const pStart = parseTime(p.startTime);
      return startMinutes === pStart;
    });

    if (conflict) {
      alert(`Conflict: Another phase "${conflict.name}" already starts at ${selectedPhase.startTime}`);
      return;
    }

    // TODO: Call update API when available
    console.log('Update phase:', selectedPhase);
    setShowEditModal(false);
  };

  // Handle delete phase
  const handleDeletePhase = async () => {
    if (!selectedPhase) return;
    
    if (window.confirm(`Delete "${selectedPhase.name}" phase? All tasks will remain but need to be reassigned.`)) {
      await deletePhase(selectedPhase.id);
      setShowEditModal(false);
      setSelectedPhase(null);
    }
  };

  // Carousel navigation
  const handleCarouselLeft = () => {
    setCarouselOffset(Math.max(0, carouselOffset - 200));
  };

  const handleCarouselRight = () => {
    const maxOffset = (timelineRef.current?.scrollWidth || 0) - (containerRef.current?.offsetWidth || 0);
    setCarouselOffset(Math.min(maxOffset, carouselOffset + 200));
  };

  const workdayStatus = getWorkdayStatus();
  const showCarousel = (timelineRef.current?.scrollWidth || 0) > (containerRef.current?.offsetWidth || 0);

  return (
    <section className="card-lg mb-6">
      {/* Header */}
      <div className="d-flex items-center justify-between mb-4">
        <div className="d-flex items-center gap-3">
          <Clock size={24} className="text-accent" />
          <h2 className="text-3xl font-bold text-neumorphic-embossed">
            Daily Kitchen Phases
          </h2>
        </div>
        <button 
          className="btn btn-accent"
          onClick={() => setShowAddModal(true)}
          aria-label="Add phase"
        >
          <Plus size={20} />
          <span>Add Phase</span>
        </button>
      </div>

      {/* Workday Status Messages */}
      {workdayStatus === 'before' && (
        <div className="badge badge-info mb-4" style={{ fontSize: '1rem', padding: 'var(--spacing-3) var(--spacing-4)' }}>
          ⏰ Work day starts at {TIMELINE_START_HOUR}:00 AM
        </div>
      )}
      {workdayStatus === 'after' && (
        <div className="badge badge-success mb-4" style={{ fontSize: '1rem', padding: 'var(--spacing-3) var(--spacing-4)' }}>
          ✅ Work day completed at {TIMELINE_END_HOUR}:00 PM
        </div>
      )}

      {/* Timeline Container */}
      <div className="neumorphic-inset" style={{ padding: 'var(--spacing-6)', position: 'relative', overflow: 'hidden' }} ref={containerRef}>
        {/* Hour markers */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: 'var(--spacing-4)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === 8 ? 'right' : 'center' }}>
              {TIMELINE_START_HOUR + i}:00
            </div>
          ))}
        </div>

        {/* Timeline with phases */}
        <div style={{ position: 'relative', height: '120px', marginBottom: 'var(--spacing-4)' }} ref={timelineRef}>
          {/* Background timeline bar */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-full)',
            transform: 'translateY(-50%)'
          }} />

          {/* Phase boxes */}
          {phases.length === 0 ? (
            <div className="text-center text-secondary" style={{ paddingTop: 'var(--spacing-4)' }}>
              No phases scheduled. Click "Add Phase" to get started!
            </div>
          ) : (
            phases.map((phase, index) => {
              const layout = calculatePhaseLayout(phase, index, phases);
              const isCurrent = isCurrentPhase(phase, phases[index + 1]);
              const progress = getPhaseProgress(phase.id);
              const userCount = getPhaseUserCount(phase.id);

              return (
                <div
                  key={phase.id}
                  className={`neumorphic-raised ${isCurrent ? 'card-highlight' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${layout.left}px`,
                    width: `${layout.width}px`,
                    top: 0,
                    height: '100%',
                    padding: 'var(--spacing-3)',
                    cursor: 'pointer',
                    border: isCurrent ? '3px solid var(--color-highlight)' : 'none',
                    boxShadow: isCurrent ? '0 0 20px var(--color-highlight)' : undefined,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => {
                    setSelectedPhase(phase);
                    setShowTasksModal(true);
                  }}
                  title={`${phase.name} (${phase.startTime} - ${layout.endTime})\nDuration: ${layout.duration} minutes\nProgress: ${progress}%`}
                >
                  {/* Phase header */}
                  <div>
                    <div className="d-flex items-center justify-between mb-1">
                      <span className="font-semibold" style={{ fontSize: '0.875rem' }}>
                        {phase.name}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm btn-circular"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhase(phase);
                          setShowEditModal(true);
                        }}
                        aria-label="Edit phase"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      {phase.startTime}
                    </div>
                  </div>

                  {/* Phase footer with progress and user count */}
                  <div>
                    {/* Progress bar */}
                    <div style={{
                      height: '4px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'var(--color-accent)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* User count */}
                    <div className="d-flex items-center gap-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                      <Users size={12} />
                      <span>{userCount} {userCount === 1 ? 'role' : 'roles'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* NOW indicator */}
          {workdayStatus === 'during' && (
            <div
              style={{
                position: 'absolute',
                left: `${calculateNowPosition()}px`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--color-error)',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-error)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                NOW
              </div>
            </div>
          )}
        </div>

        {/* Carousel controls */}
        {showCarousel && (
          <>
            <button
              className="btn btn-ghost btn-circular"
              style={{ position: 'absolute', left: 'var(--spacing-2)', top: '50%', transform: 'translateY(-50%)' }}
              onClick={handleCarouselLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="btn btn-ghost btn-circular"
              style={{ position: 'absolute', right: 'var(--spacing-2)', top: '50%', transform: 'translateY(-50%)' }}
              onClick={handleCarouselRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Add Phase Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add New Phase">
          <div className="form-group">
            <label className="form-label">Phase Name</label>
            <input
              type="text"
              className="form-control"
              value={newPhase.name}
              onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
              placeholder="e.g., Breakfast Service"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              className="form-control"
              value={newPhase.startTime}
              onChange={(e) => setNewPhase({ ...newPhase, startTime: e.target.value })}
              min="07:00"
              max="14:59"
            />
            <small className="text-secondary">Must be between 7:00 AM and 2:59 PM</small>
          </div>

          <div className="d-flex gap-3 justify-end">
            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-accent" onClick={handleAddPhase}>
              Add Phase
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Phase Modal */}
      {showEditModal && selectedPhase && (
        <Modal onClose={() => setShowEditModal(false)} title="Edit Phase">
          <div className="form-group">
            <label className="form-label">Phase Name</label>
            <input
              type="text"
              className="form-control"
              value={selectedPhase.name}
              onChange={(e) => setSelectedPhase({ ...selectedPhase, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              className="form-control"
              value={selectedPhase.startTime}
              onChange={(e) => setSelectedPhase({ ...selectedPhase, startTime: e.target.value })}
              min="07:00"
              max="14:59"
            />
            <small className="text-secondary">Must be between 7:00 AM and 2:59 PM</small>
          </div>

          <div className="d-flex gap-3 justify-between">
            <button className="btn btn-error" onClick={handleDeletePhase}>
              <Trash2 size={16} />
              Delete Phase
            </button>
            <div className="d-flex gap-3">
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={handleEditPhase}>
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Tasks Modal */}
      {showTasksModal && selectedPhase && (
        <Modal 
          onClose={() => setShowTasksModal(false)} 
          title={`${selectedPhase.name} - Tasks`}
        >
          <div className="mb-4 text-secondary">
            <strong>Time:</strong> {selectedPhase.startTime} - {calculatePhaseLayout(
              selectedPhase, 
              phases.findIndex(p => p.id === selectedPhase.id), 
              phases
            ).endTime}
          </div>

          {(() => {
            const groupedTasks = getPhaseTasksGrouped(selectedPhase.id);
            const roleNames = Object.keys(groupedTasks);

            if (roleNames.length === 0) {
              return (
                <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
                  No tasks assigned to this phase yet.
                </div>
              );
            }

            return roleNames.map(roleName => (
              <div key={roleName} className="mb-4">
                <h4 className="font-semibold mb-2 d-flex items-center gap-2">
                  <Users size={16} className="text-accent" />
                  {roleName}
                </h4>
                <div className="neumorphic-inset" style={{ padding: 'var(--spacing-3)' }}>
                  {groupedTasks[roleName].map(task => (
                    <div key={task.id} className="d-flex items-center gap-2 mb-2">
                      <CheckSquare 
                        size={16} 
                        className={task.completed ? 'text-success' : 'text-secondary'} 
                      />
                      <span className={task.completed ? 'text-secondary' : ''}>
                        {task.name || task.description}
                      </span>
                      {task.assigned_to && (
                        <span className="badge badge-sm ml-auto">
                          {users.find(u => u.id === task.assigned_to)?.name || 'Assigned'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}

          <div className="d-flex justify-end">
            <button className="btn btn-ghost" onClick={() => setShowTasksModal(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default DailyKitchenPhasesTimeline;
