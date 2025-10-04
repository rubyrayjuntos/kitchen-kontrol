
import React, { useState } from 'react';
import { Clock, Users, Calendar, FileText, BookOpen, ClipboardCheck, User, Pencil, Check, BarChart3 } from 'lucide-react';
import Modal from './Modal';
import useStore from '../store';

const Dashboard = () => {
    const [isEditingPhases, setIsEditingPhases] = useState(false);
    const [isEditingRoles, setIsEditingRoles] = useState(false);
    const [isEditingAbsences, setIsEditingAbsences] = useState(false);

    const {
        scheduleData, 
        roles, 
        absentees, 
        getPhaseColor, 
        handleApproveAbsence, 
        editingPhaseData,
        setEditingPhaseData,
        handleSavePhase,
        editingRoleData,
        setEditingRoleData,
        handleSaveRole,
        newAbsenceData,
        setNewAbsenceData,
        handleAddNewAbsence,
        handleDeleteAbsence,
        selection,
        setSelection,
        setCurrentView,
    } = useStore();

    if (!scheduleData.phases || Object.keys(roles).length === 0) {
        return <div>Loading...</div>; // Or some other placeholder
    }

    return (
        <div className="p-6 space-y-6">
        {/* Daily Kitchen Phases */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Clock className="mr-2" />
              Daily Kitchen Phases
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(scheduleData.phases).map(([phase, data]) => (
              <div key={phase} className={`p-3 rounded-lg border-2 text-center transition-colors hover:shadow-md ${getPhaseColor(data.status)}`}>
                <div className="font-semibold text-sm">{data.title}</div>
                <div className="text-xs mt-1">{data.time}</div>
                {data.status === 'active' && (
                  <div className="mt-2">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                )}
                <button onClick={() => {setIsEditingPhases(true); setEditingPhaseData(data);}} className="p-1 mt-2 text-gray-500 hover:text-gray-700 rounded"><Pencil size={14} /></button>
              </div>
            ))}
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Role Assignments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Users className="mr-2" />
                Daily Role Assignments
              </h2>
            </div>
            <div className="space-y-3">
              {Object.entries(roles ?? {}).map(([roleKey, roleData]) => {
                if (!roleData) return null; // skip bad entries safely
                const roleName = roleData?.name ?? '(Unnamed role)';
                const assignedUser = roleData?.assignedUser ?? '';

                return (
                  <div key={roleKey} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <button onClick={() => setSelection({ type: 'role', id: roleKey })} className="font-medium text-left hover:text-blue-600">
                      {roleName}
                    </button>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => assignedUser && setSelection({ type: 'user', id: assignedUser })} className="flex items-center space-x-2 hover:text-blue-600" disabled={!assignedUser}>
                        <User size={16} />
                        <span>{assignedUser}</span>
                      </button>
                      <button onClick={() => {setIsEditingRoles(true); setEditingRoleData(roleData);}} className="p-1 text-gray-500 hover:text-gray-700 rounded">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
  
          {/* Upcoming Absences */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Calendar className="mr-2" />
                Upcoming Absences
              </h2>
              <button 
                onClick={() => setIsEditingAbsences(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded"
              >
                <Pencil size={18} />
              </button>
            </div>
            {(absentees ?? []).length > 0 ? (
              <div className="space-y-3">
                {(absentees ?? []).map((absence) => {
                  if (!absence) return null;
                  const name = absence.name ?? '(Unknown)';
                  const date = absence.date ?? '—';

                  return (
                    <div 
                      key={absence.id} 
                      className={`flex items-center justify-between p-3 rounded border-l-4 ${
                        absence.approved 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-yellow-50 border-yellow-400'
                      }`}
                    >
                      <div>
                        <span className="font-medium">{name}</span>
                        <div className="text-sm text-gray-600">{absence.reason}</div>
                        {absence.approved && (
                          <div className="text-xs text-green-600">
                            Approved: {absence.approvalDate}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium">{date}</div>
                        {!absence.approved && (
                          <button
                            onClick={() => handleApproveAbsence(absence.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {absence.approved && (
                          <div className="flex items-center text-green-600">
                            <Check size={16} />
                            <span className="text-sm ml-1">Approved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming absences</p>
            )}
          </div>
        </div>
  
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setCurrentView('logs')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 transition-colors"
            >
              <FileText className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="font-medium text-blue-800">Complete Daily Logs</div>
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 transition-colors"
            >
              <BarChart3 className="mx-auto mb-2 text-green-600" size={24} />
              <div className="font-medium text-green-800">View Reports</div>
            </button>
            <button
              onClick={() => setCurrentView('training')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 transition-colors"
            >
              <BookOpen className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="font-medium text-purple-800">Access Training</div>
            </button>
            <button
              onClick={() => setCurrentView('planograms')}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border-2 border-orange-200 transition-colors"
            >
              <ClipboardCheck className="mx-auto mb-2 text-orange-600" size={24} />
              <div className="font-medium text-orange-800">Manage Planograms</div>
            </button>
          </div>
        </div>
  
        {/* Phase Tasks Modal */}
        <Modal
          isOpen={selection?.type === 'phase'}
          onClose={() => setSelection(null)}
          title={selection?.id ? `${scheduleData?.phases?.[selection?.id]?.title ?? ''} Tasks` : ''}
        >
          {selection?.type === 'phase' && (
            <div className="space-y-4">
              {Object.entries(scheduleData.phases[selection?.id]?.tasks || {}).map(([role, taskList]) => (
                <div key={role} className="border rounded p-3">
                  <h4 className="font-semibold capitalize mb-2">{role.replace('-', ' ')}</h4>
                  <div className="space-y-2">
                    {taskList.map((task, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
  
        {/* Role Tasks Modal */}
        <Modal
          isOpen={selection?.type === 'role'}
          onClose={() => setSelection(null)}
          title={selection?.id ? `${roles?.[selection?.id]?.name ?? '(Unnamed role)'} Tasks` : ''}
        >
          {selection?.type === 'role' && (
            <div className="space-y-3">
              {(roles?.[selection?.id]?.tasks ?? []).map((task, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          )}
        </Modal>
  
        {/* User Tasks Modal */}
        <Modal
          isOpen={selection?.type === 'user'}
          onClose={() => setSelection(null)}
          title={selection?.id ? `${selection?.id} - All Daily Tasks` : ''}
        >
          {selection?.type === 'user' && Object.keys(roles ?? {}).length > 0 && (
            <div className="space-y-4">
              {Object.entries(roles ?? {})
                .filter(([_, roleData]) => roleData?.assignedUser === selection?.id)
                .map(([roleKey, roleData]) => {
                  try {
                    return (
                      <div key={roleKey} className="border rounded p-3">
                        <h4 className="font-semibold mb-2">{roleData?.name ?? ''}</h4>
                        <div className="space-y-2">
                          {(roleData?.tasks ?? []).map((task, index) => (
                            <label key={index} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">{task}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering user task:', error);
                    return null;
                  }
                })}
            </div>
          )}
        </Modal>
  
        {/* Edit Modals */}
        <Modal isOpen={isEditingPhases} onClose={() => {setIsEditingPhases(false); setEditingPhaseData(null);}} title="Edit Daily Kitchen Phase">
          <div className="space-y-4">
              {editingPhaseData && (
                  <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                          <input type="text" value={editingPhaseData.title} onChange={(e) => setEditingPhaseData({...editingPhaseData, title: e.target.value})} className="border rounded p-2" />
                          <input type="text" value={editingPhaseData.time} onChange={(e) => setEditingPhaseData({...editingPhaseData, time: e.target.value})} className="border rounded p-2 ml-2" />
                      </div>
                      <button onClick={handleSavePhase} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Save</button>
                  </div>
              )}
          </div>
        </Modal>
  
        <Modal isOpen={isEditingRoles} onClose={() => {setIsEditingRoles(false); setEditingRoleData(null);}} title="Edit Daily Role Assignment">
          <div className="space-y-4">
              {editingRoleData && (
                  <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                          <input type="text" value={editingRoleData.name} onChange={(e) => setEditingRoleData({...editingRoleData, name: e.target.value})} className="border rounded p-2" />
                          <input type="text" value={editingRoleData.assignedUser} onChange={(e) => setEditingRoleData({...editingRoleData, assignedUser: e.target.value})} className="border rounded p-2 ml-2" />
                      </div>
                      <button onClick={handleSaveRole} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Save</button>
                  </div>
              )}
          </div>
        </Modal>
  
        <Modal isOpen={isEditingAbsences} onClose={() => setIsEditingAbsences(false)} title="Manage Absences">
          <div className="space-y-4">
              <div>
                  <input type="text" placeholder="Name" value={newAbsenceData.name} onChange={(e) => setNewAbsenceData({...newAbsenceData, name: e.target.value})} className="border rounded p-2 w-full" />
                  <input type="date" value={newAbsenceData.date} onChange={(e) => setNewAbsenceData({...newAbsenceData, date: e.target.value})} className="border rounded p-2 w-full mt-2" />
                  <input type="text" placeholder="Reason" value={newAbsenceData.reason} onChange={(e) => setNewAbsenceData({...newAbsenceData, reason: e.target.value})} className="border rounded p-2 w-full mt-2" />
                  <button onClick={handleAddNewAbsence} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-2">Add Absence</button>
              </div>
              <hr />
              <h4 className="font-semibold">Current Absences</h4>
              {(absentees ?? []).map((absence) => (
                  <div key={absence.id} className="flex items-center justify-between p-3 border rounded">
                      <div>{absence.name} - {absence.date}</div>
                      <button onClick={() => handleDeleteAbsence(absence.id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Delete</button>
                  </div>
              ))}
          </div>
        </Modal>
      </div>
    );
}

export default Dashboard;
