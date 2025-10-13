import React, { useEffect } from 'react';
import useStore from '../store';

const MyTasks = () => {
    const { tasks, fetchTasks, completedTasks, handleTaskCompletion } = useStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
            <div className="space-y-4">
                {tasks.map(task => (
                    <div key={task.id} className="border rounded p-3">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="rounded"
                                checked={completedTasks[task.id] || false}
                                onChange={() => handleTaskCompletion(task.id)}
                            />
                            <span className="text-sm">{task.name}</span>
                        </label>
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTasks;