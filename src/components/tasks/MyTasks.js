import React, { useEffect, useState } from 'react';
import useStore from '../../store';

const MyTasks = () => {
    const { tasks, fetchTasks } = useStore();
    const [completedTasks, setCompletedTasks] = useState({});
    const [filter, setFilter] = useState('all'); // all, active, completed

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleTaskCompletion = (taskId) => {
        setCompletedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    // Filter tasks based on completion status
    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return completedTasks[task.id];
        if (filter === 'active') return !completedTasks[task.id];
        return true;
    });

    // Group tasks by phase
    const tasksByPhase = filteredTasks.reduce((acc, task) => {
        const phaseKey = task.phase_time || 'Unscheduled';
        if (!acc[phaseKey]) {
            acc[phaseKey] = [];
        }
        acc[phaseKey].push(task);
        return acc;
    }, {});

    // Sort phases by time
    const sortedPhases = Object.keys(tasksByPhase).sort((a, b) => {
        if (a === 'Unscheduled') return 1;
        if (b === 'Unscheduled') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Tasks</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded font-medium transition ${
                            filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded font-medium transition ${
                            filter === 'active'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded font-medium transition ${
                            filter === 'completed'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {filter === 'completed' && 'No completed tasks yet'}
                        {filter === 'active' && 'All tasks completed!'}
                        {filter === 'all' && 'No tasks assigned to you'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedPhases.map(phase => (
                        <div key={phase} className="bg-white rounded-lg shadow">
                            {/* Phase Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-t-lg">
                                <h2 className="text-lg font-bold">
                                    {phase !== 'Unscheduled' && phase}
                                    {phase === 'Unscheduled' && 'Unscheduled Tasks'}
                                </h2>
                            </div>

                            {/* Tasks Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">✓</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Task Name</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Assigned To</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Phase</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasksByPhase[phase].map((task, idx) => (
                                            <tr
                                                key={task.id}
                                                className={`border-b transition ${
                                                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                } hover:bg-blue-50 ${
                                                    completedTasks[task.id] ? 'opacity-60' : ''
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded cursor-pointer"
                                                        checked={completedTasks[task.id] || false}
                                                        onChange={() => handleTaskCompletion(task.id)}
                                                    />
                                                </td>
                                                <td className={`px-4 py-3 font-medium ${
                                                    completedTasks[task.id] ? 'line-through text-gray-400' : 'text-gray-900'
                                                }`}>
                                                    {task.name}
                                                </td>
                                                <td className={`px-4 py-3 text-sm ${
                                                    completedTasks[task.id] ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    {task.description}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                                                        {task.assigned_user_name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                                        {task.role_name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                                        {task.phase_name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                                    {task.phase_time ? task.phase_time.substring(0, 5) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Footer */}
            {filteredTasks.length > 0 && (
                <div className="mt-6 bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        <span className="font-semibold">{filteredTasks.length}</span> total tasks
                        {filter === 'all' && (
                            <>
                                {' • '}
                                <span className="text-yellow-600">
                                    <span className="font-semibold">{filteredTasks.filter(t => !completedTasks[t.id]).length}</span> active
                                </span>
                                {' • '}
                                <span className="text-green-600">
                                    <span className="font-semibold">{filteredTasks.filter(t => completedTasks[t.id]).length}</span> completed
                                </span>
                            </>
                        )}
                    </div>
                    {filter === 'all' && filteredTasks.length > 0 && (
                        <div className="text-sm">
                            <span className="text-gray-600">
                                Progress: 
                                <span className="font-bold text-blue-600 ml-2">
                                    {Math.round((filteredTasks.filter(t => completedTasks[t.id]).length / filteredTasks.length) * 100)}%
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyTasks;