
import { create } from 'zustand';

const useStore = create((set) => ({
  scheduleData: { phases: {} },
  roles: {},
  absentees: [],
  trainingModules: [],
  newAbsenceData: { name: '', date: '', reason: '' },
  selection: null,
  editingPhaseData: null,
  editingRoleData: null,
  loading: true,
  currentView: 'dashboard',
  completedTasks: {},

  setSelection: (value) => set({ selection: value }),
  setEditingPhaseData: (value) => set({ editingPhaseData: value }),
  setEditingRoleData: (value) => set({ editingRoleData: value }),
  setNewAbsenceData: (value) => set({ newAbsenceData: value }),


  fetchPhases: async () => {
    const res = await fetch("/api/phases");
    const data = await res.json();
    return data.data.reduce((acc, phase) => {
        acc[phase.id] = { ...phase, tasks: {} };
        return acc;
    }, {});
  },

  fetchRoles: async () => {
    const res = await fetch("/api/roles");
    const data = await res.json();
    return data.data.reduce((acc, role) => {
        acc[role.id] = { ...role, tasks: [] };
        return acc;
    }, {});
  },

  fetchTasks: async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    return data.data;
  },

  fetchAbsentees: async () => {
    const res = await fetch("/api/absences");
    const data = await res.json();
    return data.data;
  },

  fetchTrainingModules: async () => {
    const res = await fetch("/api/training-modules");
    const data = await res.json();
    return data.data.map(module => ({
        ...module,
        content: JSON.parse(module.content)
    }));
  },

  fetchInitialData: async () => {
    set({ loading: true });
    try {
        const [phasesMap, rolesMap, tasks, absentees, trainingModules] = await Promise.all([
            useStore.getState().fetchPhases(),
            useStore.getState().fetchRoles(),
            useStore.getState().fetchTasks(),
            useStore.getState().fetchAbsentees(),
            useStore.getState().fetchTrainingModules(),
        ]);

        const tasksByRole = {};
        const tasksByPhase = {};

        for (const task of tasks) {
            if (task.role_id) {
                if (!tasksByRole[task.role_id]) {
                    tasksByRole[task.role_id] = [];
                }
                tasksByRole[task.role_id].push(task.task);
            }
            if (task.phase_id) {
                if (!tasksByPhase[task.phase_id]) {
                    tasksByPhase[task.phase_id] = {};
                }
                if (!tasksByPhase[task.phase_id][task.role_id || 'all']) {
                    tasksByPhase[task.phase_id][task.role_id || 'all'] = [];
                }
                tasksByPhase[task.phase_id][task.role_id || 'all'].push(task.task);
            }
        }

        for (const roleId in rolesMap) {
            if (tasksByRole[roleId]) {
                rolesMap[roleId].tasks = tasksByRole[roleId];
            }
        }

        for (const phaseId in phasesMap) {
            if (tasksByPhase[phaseId]) {
                phasesMap[phaseId].tasks = tasksByPhase[phaseId];
            }
        }

        set({ 
            scheduleData: { phases: phasesMap }, 
            roles: rolesMap, 
            absentees: absentees, 
            trainingModules,
            loading: false
        });
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        set({ loading: false });
    }
  },

  getCurrentTimeString: () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  },

  getCurrentDateString: () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  getPhaseColor: (status) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  setSelectedRole: (role) => set({ selectedRole: role }),

  makeApiCall: async (endpoint, method, body, callback) => {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(endpoint, options);
        const data = await res.json();
        set(callback(data));
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
    }
  },

  handleEditPhase: (phaseId) => set(state => ({ editingPhaseData: { ...state.scheduleData.phases[phaseId], id: phaseId }})),
  handleSavePhase: () => set(state => {
    useStore.getState().makeApiCall(
        `/api/phases/${state.editingPhaseData.id}`,
        'PUT',
        state.editingPhaseData,
        () => (prev) => ({
            scheduleData: {
                ...prev.scheduleData,
                phases: {
                    ...prev.scheduleData.phases,
                    [state.editingPhaseData.id]: state.editingPhaseData
                }
            },
            editingPhaseData: null
        })
    );
    return state;
  }),
  handleEditRole: (roleId) => set(state => ({ editingRoleData: { ...state.roles[roleId], id: roleId }})),
  handleSaveRole: () => set(state => {
    useStore.getState().makeApiCall(
        `/api/roles/${state.editingRoleData.id}`,
        'PUT',
        state.editingRoleData,
        () => (prev) => ({
            roles: {
                ...prev.roles,
                [state.editingRoleData.id]: state.editingRoleData
            },
            editingRoleData: null
        })
    );
    return state;
  }),
  handleAddNewAbsence: () => set(state => {
    useStore.getState().makeApiCall(
        "/api/absences",
        'POST',
        state.newAbsenceData,
        (data) => (prev) => ({
            absentees: [...prev.absentees, { ...state.newAbsenceData, id: data.id, approved: false, approvalDate: null }],
            newAbsenceData: { name: '', date: '', reason: '' }
        })
    );
    return state;
  }),
  handleDeleteAbsence: (absenceId) => set(state => {
    useStore.getState().makeApiCall(
        `/api/absences/${absenceId}`,
        'DELETE',
        null,
        () => (prev) => ({ absentees: prev.absentees.filter(absence => absence.id !== absenceId) })
    );
    return state;
  }),
  handleApproveAbsence: (absenceId) => set(state => {
    const newApprovalDate = new Date().toISOString().split('T')[0];
    useStore.getState().makeApiCall(
        `/api/absences/${absenceId}`,
        'PUT',
        { approved: true, approvalDate: newApprovalDate },
        () => (prev) => ({ 
            absentees: prev.absentees.map(absence => 
              absence.id === absenceId 
                ? { ...absence, approved: true, approvalDate: newApprovalDate }
                : absence
            )
        })
    );
    return state;
  }),
  handleTaskCompletion: (taskId) => set(state => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/logs/${taskId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, status: 'completed' })
      }
    ).then(() => {
        set(prev => ({ completedTasks: {...prev.completedTasks, [taskId]: !prev.completedTasks[taskId]}}));
    });
    return state;
  }),
  setCurrentView: (view) => set({ currentView: view }),

  getCurrentTimeString: () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  },

  getCurrentDateString: () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
}));

export default useStore;
