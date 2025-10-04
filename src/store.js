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
  user: null,
  users: [],
  auditLog: [],
  staffPerformance: [],
  planograms: [],
  selectedPlanogram: null,

  login: async (email, password) => {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.token) {
            set({ user: data.token });
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
  },

  makeApiCall: async (endpoint, method, body) => {
    try {
        const token = useStore.getState().user;
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['x-auth-token'] = token;
        }
        const options = {
            method,
            headers,
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(endpoint, options);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
    }
  },

  fetchUsers: async () => {
    const data = await useStore.getState().makeApiCall('/api/users', 'GET');
    set({ users: data.data });
  },

  addUser: async (user) => {
    await useStore.getState().makeApiCall('/api/users', 'POST', user);
    useStore.getState().fetchUsers();
  },

  updateUser: async (user) => {
    await useStore.getState().makeApiCall(`/api/users/${user.id}`, 'PUT', user);
    useStore.getState().fetchUsers();
  },

  deleteUser: async (userId) => {
    await useStore.getState().makeApiCall(`/api/users/${userId}`, 'DELETE');
    useStore.getState().fetchUsers();
  },

  addRole: async (role) => {
    await useStore.getState().makeApiCall('/api/roles', 'POST', role);
    useStore.getState().fetchRoles();
  },

  updateRole: async (role) => {
    await useStore.getState().makeApiCall(`/api/roles/${role.id}`, 'PUT', role);
    useStore.getState().fetchRoles();
  },

  deleteRole: async (roleId) => {
    await useStore.getState().makeApiCall(`/api/roles/${roleId}`, 'DELETE');
    useStore.getState().fetchRoles();
  },

  assignRole: async (userId, roleId) => {
    await useStore.getState().makeApiCall('/api/roles/assign', 'POST', { userId, roleId });
    useStore.getState().fetchRoles();
  },

  setSelection: (value) => set({ selection: value }),
  setEditingPhaseData: (value) => set({ editingPhaseData: value }),
  setEditingRoleData: (value) => set({ editingRoleData: value }),
  setNewAbsenceData: (value) => set({ newAbsenceData: value }),


  fetchPhases: async () => {
    const data = await useStore.getState().makeApiCall('/api/phases', 'GET');
    return data.data.reduce((acc, phase) => {
        acc[phase.id] = { ...phase, tasks: {} };
        return acc;
    }, {});
  },

  fetchRoles: async () => {
    const data = await useStore.getState().makeApiCall('/api/roles', 'GET');
    return data.data.reduce((acc, role) => {
        acc[role.id] = { ...role, tasks: [] };
        return acc;
    }, {});
  },

  fetchTasks: async () => {
    const data = await useStore.getState().makeApiCall('/api/tasks', 'GET');
    return data.data;
  },

  fetchAbsentees: async () => {
    const data = await useStore.getState().makeApiCall('/api/absences', 'GET');
    return data.data;
  },

  fetchTrainingModules: async () => {
    const data = await useStore.getState().makeApiCall('/api/training-modules', 'GET');
    return data.data.map(module => ({
        ...module,
        content: JSON.parse(module.content)
    }));
  },

  fetchAuditLog: async () => {
    const data = await useStore.getState().makeApiCall('/api/audit-log', 'GET');
    set({ auditLog: data.data });
  },

  fetchStaffPerformance: async () => {
    const data = await useStore.getState().makeApiCall('/api/performance/staff', 'GET');
    set({ staffPerformance: data.data });
  },

  fetchPlanograms: async () => {
    const data = await useStore.getState().makeApiCall('/api/planograms', 'GET');
    set({ planograms: data.data });
  },

  fetchPlanogramByDate: async (date) => {
    const data = await useStore.getState().makeApiCall(`/api/planograms/${date}`, 'GET');
    set({ selectedPlanogram: data.data });
  },

  savePlanogram: async (planogram) => {
    const method = planogram.id ? 'PUT' : 'POST';
    const endpoint = planogram.id ? `/api/planograms/${planogram.id}` : '/api/planograms';
    await useStore.getState().makeApiCall(endpoint, method, planogram);
    useStore.getState().fetchPlanograms();
  },

  fetchInitialData: async () => {
    set({ loading: true });
    try {
        await useStore.getState().fetchUsers();
        await useStore.getState().fetchPlanograms();
        const [phasesMap, rolesMap, tasks, absentees, trainingModules] = await Promise.all([
            useStore.getState().fetchPhases(),
            useStore.getState().fetchRoles(),
            useStore.getState().fetchTasks(),
            useStore.getState().fetchAbsentees(),
            useStore.getState().fetchTrainingModules(),
            useStore.getState().fetchAuditLog(),
            useStore.getState().fetchStaffPerformance(),
        ]);

        const tasksByRole = {};
        const tasksByPhase = {};

        for (const task of tasks) {
            if (task.role_id) {
                if (!tasksByRole[task.role_id]) {
                    tasksByRole[task.role_id] = [];
                }
                tasksByRole[task.role_id].push(task);
            }
            if (task.phase_id) {
                if (!tasksByPhase[task.phase_id]) {
                    tasksByPhase[task.phase_id] = {};
                }
                if (!tasksByPhase[task.phase_id][task.role_id || 'all']) {
                    tasksByPhase[task.phase_id][task.role_id || 'all'] = [];
                }
                tasksByPhase[task.phase_id][task.role_id || 'all'].push(task);
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
        });
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
    } finally {
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

  handleEditPhase: (phaseId) => set(state => ({ editingPhaseData: { ...state.scheduleData.phases[phaseId], id: phaseId }})),
  handleSavePhase: () => {
    const { editingPhaseData } = useStore.getState();
    useStore.getState().makeApiCall(
        `/api/phases/${editingPhaseData.id}`,
        'PUT',
        editingPhaseData
    ).then(() => {
        set(prev => ({
            scheduleData: {
                ...prev.scheduleData,
                phases: {
                    ...prev.scheduleData.phases,
                    [editingPhaseData.id]: editingPhaseData
                }
            },
            editingPhaseData: null
        }));
    });
  },
  handleEditRole: (roleId) => set(state => ({ editingRoleData: { ...state.roles[roleId], id: roleId }})),
  handleSaveRole: () => {
    const { editingRoleData } = useStore.getState();
    useStore.getState().makeApiCall(
        `/api/roles/${editingRoleData.id}`,
        'PUT',
        editingRoleData
    ).then(() => {
        set(prev => ({
            roles: {
                ...prev.roles,
                [editingRoleData.id]: editingRoleData
            },
            editingRoleData: null
        }));
    });
  },
  handleAddNewAbsence: () => {
    const { newAbsenceData } = useStore.getState();
    useStore.getState().makeApiCall(
        "/api/absences",
        'POST',
        newAbsenceData
    ).then((data) => {
        set(prev => ({
            absentees: [...prev.absentees, { ...newAbsenceData, id: data.id, approved: false, approvalDate: null }],
            newAbsenceData: { name: '', date: '', reason: '' }
        }));
    });
  },
  handleDeleteAbsence: (absenceId) => {
    useStore.getState().makeApiCall(
        `/api/absences/${absenceId}`,
        'DELETE'
    ).then(() => {
        set(prev => ({ absentees: prev.absentees.filter(absence => absence.id !== absenceId) }));
    });
  },
  handleApproveAbsence: (absenceId) => {
    const newApprovalDate = new Date().toISOString().split('T')[0];
    useStore.getState().makeApiCall(
        `/api/absences/${absenceId}`,
        'PUT',
        { approved: true, approvalDate: newApprovalDate }
    ).then(() => {
        set(prev => ({
            absentees: prev.absentees.map(absence => 
              absence.id === absenceId 
                ? { ...absence, approved: true, approvalDate: newApprovalDate }
                : absence
            )
        }));
    });
  },
  handleTaskCompletion: (taskId) => set(state => {
    const today = new Date().toISOString().split('T')[0];
    useStore.getState().makeApiCall(`/api/logs/${taskId}/complete`, 'POST', { date: today, status: 'completed' }).then(() => {
        set(prev => ({ completedTasks: {...prev.completedTasks, [taskId]: !prev.completedTasks[taskId]}}));
    });
    return state;
  }),
  setCurrentView: (view) => set({ currentView: view }),
}));

export default useStore;