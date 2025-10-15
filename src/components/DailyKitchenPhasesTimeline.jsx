import React, { useState, useEffect, useRef } from 'react';
import { Clock, Pencil, Plus, ChevronLeft, ChevronRight, Trash2, Users, CheckSquare, FileText } from 'lucide-react';
import Modal from './Modal';
import useStore from '../store';
import { apiRequest } from '../utils/api';

const DailyKitchenPhasesTimeline = () => {
  const { scheduleData, createPhase, deletePhase, users, user } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [newPhase, setNewPhase] = useState({ name: '', startTime: '08:00' });
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [logDeadlines, setLogDeadlines] = useState([]);
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

  // Fetch log assignments with deadlines
  useEffect(() => {
    const fetchLogDeadlines = async () => {
      if (!user?.token) return;
      
      try {
        const data = await apiRequest('/api/logs/assignments/me', user.token);
        // Transform to include time info for timeline rendering
        const deadlines = (data || []).map(assignment => ({
          ...assignment,
          due_minutes: assignment.due_time ? parseTime(assignment.due_time.substring(0, 5)) : null,
          status: assignment.is_completed ? 'completed' : 
                  (new Date() > new Date(assignment.due_time) ? 'overdue' : 'pending')
        })).filter(d => d.due_minutes !== null);
        
        setLogDeadlines(deadlines);
      } catch (error) {
        console.error('Error fetching log deadlines:', error);
      }
    };

    fetchLogDeadlines();
  }, [user?.token]);

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

  const getPhaseRoleAssignments = (phaseId) => {
    const phaseData = scheduleData?.phases?.[phaseId];
    return Array.isArray(phaseData?.roles) ? phaseData.roles : [];
  };

  // Collect tasks grouped by role for a phase
  const getPhaseTasksGrouped = (phaseId) => {
    const assignments = getPhaseRoleAssignments(phaseId);
    return assignments.reduce((grouped, role) => {
      const roleName = role.name || role.title || `Role ${role.id}`;
      const roleTasks = Array.isArray(role.tasks) ? role.tasks : [];
      if (roleTasks.length > 0) {
        grouped[roleName] = roleTasks;
      }
      return grouped;
    }, {});
  };

  // Provide a simple task summary for a phase
  const getPhaseTaskSummary = (phaseId) => {
    const groupedTasks = getPhaseTasksGrouped(phaseId);
    const totalTasks = Object.values(groupedTasks).reduce((sum, taskList) => sum + taskList.length, 0);
    return { totalTasks };
  };

  // Get assigned roles count for phase
  const getPhaseUserCount = (phaseId) => {
    return getPhaseRoleAssignments(phaseId).length;
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
    setCarouselOffset(Math.max(0, carouselOffset - 300));
  };

  const handleCarouselRight = () => {
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const totalWidth = phases.reduce((sum, phase, index) => {
      const layout = calculatePhaseLayout(phase, index, phases);
      return Math.max(sum, layout.left + layout.width + (index * 8));
    }, 0);
    const maxOffset = Math.max(0, totalWidth - containerWidth + 50); // Add 50px padding
    setCarouselOffset(Math.min(maxOffset, carouselOffset + 300));
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
      <div style={{ position: 'relative' }} ref={containerRef}>
        {/* Hour markers */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: 'var(--spacing-3)',
          paddingLeft: 'var(--spacing-6)',
          paddingRight: 'var(--spacing-6)',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          fontWeight: '500',
          opacity: '0.8'
        }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === 8 ? 'right' : 'center' }}>
              {TIMELINE_START_HOUR + i}:00
            </div>
          ))}
        </div>

        {/* Timeline inset container */}
        <div 
          className="neumorphic-inset" 
          style={{ 
            padding: 'var(--spacing-6)', 
            position: 'relative', 
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
            minHeight: '180px'
          }}
        >
          {/* Timeline with phases */}
          <div 
            style={{ 
              position: 'relative', 
              height: '140px', 
              marginBottom: 'var(--spacing-4)',
              transform: `translateX(-${carouselOffset}px)`,
              transition: 'transform 0.3s ease'
            }} 
            ref={timelineRef}
          >
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
              const { totalTasks } = getPhaseTaskSummary(phase.id);
              const userCount = getPhaseUserCount(phase.id);

              return (
                <div
                  key={phase.id}
                  className={`neumorphic-raised ${isCurrent ? 'card-highlight' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${layout.left + (index * 8)}px`,
                    width: `${layout.width - 8}px`,
                    top: 0,
                    height: '100%',
                    padding: 'var(--spacing-3)',
                    cursor: 'pointer',
                    border: isCurrent ? '4px solid #22c55e' : '1px solid transparent',
                    boxShadow: isCurrent 
                      ? '0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.1)' 
                      : undefined,
                    background: isCurrent ? 'var(--bg-elevated)' : 'var(--bg-primary)',
                    transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden'
                  }}
                  onClick={() => {
                    setSelectedPhase(phase);
                    setShowTasksModal(true);
                  }}
                  title={`${phase.name} (${phase.startTime} - ${layout.endTime})\nDuration: ${layout.duration} minutes\nTasks assigned: ${totalTasks}`}
                >
                  {/* Phase header */}
                  <div>
                    <div className="d-flex items-center justify-between mb-1">
                      <span className="font-semibold" style={{ fontSize: '0.875rem' }}>
                        {phase.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circular"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhase({...phase});
                          setShowEditModal(true);
                        }}
                        aria-label="Edit phase"
                        style={{ zIndex: 2, position: 'relative' }}
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
                    <div className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: 'var(--spacing-2)' }}>
                      {totalTasks > 0 ? `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'} assigned` : 'No tasks assigned yet'}
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
                width: '3px',
                background: '#ef4444',
                zIndex: 5,
                pointerEvents: 'none',
                boxShadow: '0 0 10px #ef4444'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ef4444',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                zIndex: 6
              }}>
                NOW
              </div>
            </div>
          )}

          {/* Log Deadline Markers */}
          {logDeadlines.map((deadline, idx) => {
            const containerWidth = containerRef.current?.offsetWidth || 1000;
            const pixelsPerMinute = containerWidth / TIMELINE_DURATION_MINUTES;
            const deadlinePosition = (deadline.due_minutes - TIMELINE_START_HOUR * 60) * pixelsPerMinute;
            
            // Skip if outside timeline range
            if (deadline.due_minutes < TIMELINE_START_HOUR * 60 || deadline.due_minutes > TIMELINE_END_HOUR * 60) {
              return null;
            }

            const markerColor = 
              deadline.status === 'completed' ? '#22c55e' :
              deadline.status === 'overdue' ? '#ef4444' :
              '#eab308';

            return (
              <div
                key={`deadline-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${deadlinePosition}px`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: markerColor,
                  zIndex: 4,
                  pointerEvents: 'none',
                  opacity: 0.7
                }}
              >
                <div 
                  title={`${deadline.template_name} - ${deadline.due_time}`}
                  style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: markerColor,
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 6,
                    pointerEvents: 'auto',
                    cursor: 'help'
                  }}
                >
                  <FileText size={10} style={{ display: 'inline', marginRight: '2px' }} />
                  {deadline.template_name.substring(0, 15)}{deadline.template_name.length > 15 ? '...' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel controls */}
        {showCarousel && (
          <>
            <button
              className="btn btn-ghost btn-circular"
              style={{ position: 'absolute', left: 'var(--spacing-2)', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
              onClick={handleCarouselLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="btn btn-ghost btn-circular"
              style={{ position: 'absolute', right: 'var(--spacing-2)', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
              onClick={handleCarouselRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        </div>
      </div>

      {/* Add Phase Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Phase">
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
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Phase">
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
          isOpen={showTasksModal}
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
