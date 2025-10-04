
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';
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
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2">
                <div>Equipment</div>
                <div>Morning Temp</div>
                <div>Afternoon Temp</div>
                <div>Initial</div>
              </div>
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <div className="flex items-center">{entry.equipment}</div>
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-2"
                    value={entry.morning}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'morning', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-2"
                    value={entry.afternoon}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'afternoon', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Initials"
                    className="border rounded p-2"
                    value={entry.initial}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        
        case 'food-temps':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 font-semibold border-b pb-2 text-sm">
                <div>Food Item</div>
                <div>Arrival</div>
                <div>Pre-Service</div>
                <div>Mid-Service</div>
                <div>Portions</div>
                <div>Waste</div>
                <div>Initial</div>
              </div>
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-7 gap-2">
                  <div className="flex items-center text-sm">{entry.item}</div>
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-1 text-sm"
                    value={entry.arrival}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'arrival', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-1 text-sm"
                    value={entry.preService}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'preService', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="°F"
                    className="border rounded p-1 text-sm"
                    value={entry.midService}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'midService', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    className="border rounded p-1 text-sm"
                    value={entry.portions}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'portions', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    className="border rounded p-1 text-sm"
                    value={entry.waste}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'waste', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Init"
                    className="border rounded p-1 text-sm"
                    value={entry.initial}
                    onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                  />
                </div>
              ))}
            </div>
          );
        
        case 'planograms':
          return (
            <div className="space-y-4">
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{entry.zone}</div>
                    <div className="text-sm text-gray-600">Assigned: {entry.assignee}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Initials"
                      className="border rounded p-2 w-20"
                      value={entry.initial}
                      onChange={(e) => updateLogEntry(selectedLog.id, index, 'initial', e.target.value)}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={entry.completed}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'completed', e.target.checked)}
                      />
                      <span>Complete</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          );
        
        case 'reimbursable-meals':
          return (
            <div className="space-y-4">
              {currentLog.entries.map((entry, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Service Period</label>
                      <div className="text-sm">{entry.meal}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Planned</label>
                      <div className="text-sm">{entry.planned}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Served</label>
                      <input
                        type="number"
                        className="border rounded p-1 w-full"
                        value={entry.served}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'served', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Waste</label>
                      <input
                        type="number"
                        className="border rounded p-1 w-full"
                        value={entry.waste}
                        onChange={(e) => updateLogEntry(selectedLog.id, index, 'waste', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Components (check 3 of 5)</label>
                    <div className="grid grid-cols-5 gap-4">
                      {Object.entries(entry.components).map(([component, checked]) => (
                        <label key={component} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateLogEntry(selectedLog.id, index, 'components', {
                              ...entry.components,
                              [component]: e.target.checked
                            })}
                          />
                          <span className="text-sm capitalize">{component}</span>
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Daily Logs</h1>
        
        {!selectedLog ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logCategories.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{log.name}</h3>
                  {log.status === 'completed' ? (
                    <CheckCircle2 className="text-green-600" size={24} />
                  ) : (
                    <AlertCircle className="text-orange-600" size={24} />
                  )}
                </div>
                <button
                  onClick={() => setSelectedLog(log)}
                  className={`w-full py-2 px-4 rounded font-medium ${
                    log.status === 'completed'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {log.status === 'completed' ? 'View/Edit Log' : 'Complete Log'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedLog.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    handleTaskCompletion(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Save size={16} className="inline mr-2" />
                  Save & Complete
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
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
