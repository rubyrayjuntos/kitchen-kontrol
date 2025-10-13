
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import useStore from '../store';

const LogsView = () => {
    const {
        completedTasks,
        handleTaskCompletion
    } = useStore();

    const [selectedLog, setSelectedLog] = useState(null);
    const [logEntries, setLogEntries] = useState({
      'equipment-temps': {
        entries: [
          { equipment: 'Walk-in Fridge', morning: '', afternoon: '', initial: 'JS' },
          { equipment: 'Freezer', morning: '', afternoon: '', initial: 'JS' },
          { equipment: 'Milk Cooler 1', morning: '', afternoon: '', initial: 'MG' },
          { equipment: 'Milk Cooler 2', morning: '', afternoon: '', initial: 'MG' },
          { equipment: 'Warmer 1', morning: '', afternoon: '', initial: 'CR' },
          { equipment: 'Warmer 2', morning: '', afternoon: '', initial: 'CR' }
        ]
      },
      'food-temps': {
        entries: [
          { item: 'Main Entree', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'SJ' },
          { item: 'Side Dish 1', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'AM' },
          { item: 'Side Dish 2', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'AM' },
          { item: 'Vegetables', arrival: '', preService: '', midService: '', portions: '', waste: '', initial: 'CR' }
        ]
      },
      'planograms': {
        entries: [
          { zone: 'Zone 1: Serving Line', assignee: 'John Smith', completed: false, initial: '' },
          { zone: 'Zone 2: Dish Pit', assignee: 'Maria Garcia', completed: false, initial: '' },
          { zone: 'Zone 3: FOH/POS', assignee: 'Carlos Rodriguez', completed: false, initial: '' },
          { zone: 'Zone 4: Floors/Utility', assignee: 'Sarah Johnson', completed: false, initial: '' },
          { zone: 'Zone 5: Monitor/Compliance', assignee: 'Ana Martinez', completed: false, initial: '' }
        ]
      },
      'sanitation-setup': {
        entries: [
          { station: 'Hand Wash Station 1', sanitizer: '', paperTowels: '', soap: '', completed: false, initial: '' },
          { station: 'Hand Wash Station 2', sanitizer: '', paperTowels: '', soap: '', completed: false, initial: '' },
          { station: '3-Compartment Sink', sanitizer: '', testStrips: '', completed: false, initial: '' }
        ]
      },
      'reimbursable-meals': {
        entries: [
          { meal: 'Breakfast', planned: 250, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 1', planned: 220, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 2', planned: 240, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 3', planned: 210, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 },
          { meal: 'Lunch Period 4', planned: 180, served: 0, components: { protein: false, grain: false, fruit: false, vegetable: false, milk: false }, waste: 0 }
        ]
      }
    });

    const logCategories = [
      { id: 'equipment-temps', name: 'Equipment Temperatures', status: completedTasks['equipment-temps'] ? 'completed' : 'pending' },
      { id: 'food-temps', name: 'Food Temperatures', status: completedTasks['food-temps'] ? 'completed' : 'pending' },
      { id: 'planograms', name: 'Planograms', status: completedTasks['planograms'] ? 'completed' : 'pending' },
      { id: 'sanitation-setup', name: 'Sanitation Setup', status: completedTasks['sanitation-setup'] ? 'completed' : 'pending' },
      { id: 'reimbursable-meals', name: 'Reimbursable Meals', status: completedTasks['reimbursable-meals'] ? 'completed' : 'pending' }
    ];

    const updateLogEntry = (logType, index, field, value) => {
      setLogEntries(prev => ({
        ...prev,
        [logType]: {
          ...prev[logType],
          entries: prev[logType].entries.map((entry, i) => 
            i === index ? { ...entry, [field]: value } : entry
          )
        }
      }));
    };

    const renderLogForm = () => {
      if (!selectedLog) return null;
      
      const currentLog = logEntries[selectedLog.id];
      
      switch (selectedLog.id) {
        case 'equipment-temps':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                gap: 'var(--spacing-4)', 
                fontWeight: '600',
                borderBottom: '2px solid var(--border-primary)',
                paddingBottom: 'var(--spacing-2)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <div>Equipment</div>
                <div>Morning Temp</div>
                <div>Afternoon Temp</div>
                <div>Initial</div>
              </div>
              {currentLog.entries.map((entry, index) => (
                <div key={index} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                  gap: 'var(--spacing-4)',
                  alignItems: 'center'
                }}>
                  <div className="font-medium">{entry.equipment}</div>
                  <input
                    type="text"
                    placeholder="°F"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}
                    value={entry.morning}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'morning', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}
                    value={entry.afternoon}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'afternoon', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Initials"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}
                    value={entry.initial}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        
        case 'food-temps':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.5fr repeat(6, 1fr)', 
                gap: 'var(--spacing-2)', 
                fontWeight: '600',
                borderBottom: '2px solid var(--border-primary)',
                paddingBottom: 'var(--spacing-2)',
                fontSize: 'var(--font-size-xs)'
              }}>
                <div>Food Item</div>
                <div>Arrival</div>
                <div>Pre-Service</div>
                <div>Mid-Service</div>
                <div>Portions</div>
                <div>Waste</div>
                <div>Initial</div>
              </div>
              {currentLog.entries.map((entry, index) => (
                <div key={index} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.5fr repeat(6, 1fr)', 
                  gap: 'var(--spacing-2)',
                  alignItems: 'center'
                }}>
                  <div className="font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>{entry.item}</div>
                  <input
                    type="text"
                    placeholder="°F"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)' }}
                    value={entry.arrival}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'arrival', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)' }}
                    value={entry.preService}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'preService', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)' }}
                    value={entry.midService}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'midService', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)' }}
                    value={entry.portions}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'portions', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)' }}
                    value={entry.waste}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'waste', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Init"
                    className="neumorphic-input"
                    style={{ padding: 'var(--spacing-1)', fontSize: 'var(--font-size-xs)' }}
                    value={entry.initial}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        
        case 'planograms':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="neumorphic-inset" style={{
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div className="font-medium">{entry.zone}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Assigned: {entry.assignee}
                    </div>
                  </div>
                  <div className="d-flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Initials"
                      className="neumorphic-input"
                      style={{ padding: 'var(--spacing-2)', width: '80px', fontSize: 'var(--font-size-sm)' }}
                      value={entry.initial}
                      onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                    />
                    <label className="d-flex items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={entry.completed}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'completed', e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>Complete</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          );
        
        case 'reimbursable-meals':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="neumorphic-inset" style={{
                  padding: 'var(--spacing-4)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Service Period</label>
                      <div className="font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>{entry.meal}</div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Planned</label>
                      <div className="font-medium" style={{ fontSize: 'var(--font-size-sm)' }}>{entry.planned}</div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Served</label>
                      <input
                        type="number"
                        className="neumorphic-input"
                        style={{ padding: 'var(--spacing-1)', width: '100%', fontSize: 'var(--font-size-sm)' }}
                        value={entry.served}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'served', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 'var(--font-size-sm)' }}>Waste</label>
                      <input
                        type="number"
                        className="neumorphic-input"
                        style={{ padding: 'var(--spacing-1)', width: '100%', fontSize: 'var(--font-size-sm)' }}
                        value={entry.waste}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'waste', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                      Required Components (check 3 of 5)
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gap: 'var(--spacing-4)' 
                    }}>
                      {Object.entries(entry.components).map(([component, checked]) => (
                        <label key={component} className="d-flex items-center gap-1" style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateLogEntry(selectedLog.id, index, 'components', {
                              ...entry.components,
                              [component]: e.target.checked
                            })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: 'var(--font-size-sm)', textTransform: 'capitalize' }}>
                            {component}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        
        default:
          return <div>Log form not implemented</div>;
      }
    };

    return (
      <div style={{ padding: 'var(--spacing-6)' }}>
        <h1 className="text-neumorphic-embossed" style={{ 
          fontSize: 'var(--font-size-2xl)', 
          fontWeight: '700',
          marginBottom: 'var(--spacing-6)' 
        }}>
          Daily Logs
        </h1>
        
        {!selectedLog ? (
          <div className="demo-grid">
            {logCategories.map((log) => (
              <div key={log.id} className="neumorphic-raised" style={{ padding: 'var(--spacing-6)' }}>
                <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                  <h3 className="font-semibold">{log.name}</h3>
                  {log.status === 'completed' ? (
                    <CheckCircle2 className="text-success" size={24} />
                  ) : (
                    <AlertCircle className="text-warning" size={24} />
                  )}
                </div>
                <button
                  onClick={() => setSelectedLog(log)}
                  className={`btn ${
                    log.status === 'completed'
                      ? 'btn-success'
                      : 'btn-primary'
                  }`}
                  style={{ width: '100%', fontWeight: '500' }}
                >
                  {log.status === 'completed' ? 'View/Edit Log' : 'Complete Log'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-lg">
            <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2 className="text-xl font-bold text-neumorphic-embossed">{selectedLog.name}</h2>
              <div className="d-flex gap-2">
                <button
                  onClick={() => {
                    handleTaskCompletion(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="btn btn-success"
                >
                  <Save size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                  Save & Complete
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="btn btn-ghost"
                >
                  <ArrowLeft size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                  Back
                </button>
              </div>
            </div>
            {renderLogForm()}
          </div>
        )}
      </div>
    );
}

export default LogsView;
