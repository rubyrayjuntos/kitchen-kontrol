import React from 'react';
import { Home, FileText, BookOpen, BarChart3, ClipboardCheck, Globe } from 'lucide-react';
import useStore from '../store';

const NavigationBar = () => {
    const { currentView, setCurrentView, currentLanguage, setCurrentLanguage, getCurrentTimeString, getCurrentDateString } = useStore();

    return (
        <nav className="bg-blue-900 text-white p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold">Kitchen Kontrol</h1>
            <div className="flex space-x-4">
                <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
                >
                <Home size={18} />
                <span>Dashboard</span>
                </button>
                <button
                onClick={() => setCurrentView('logs')}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'logs' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
                >
                <FileText size={18} />
                <span>Daily Logs</span>
                </button>
                <button
                onClick={() => setCurrentView('training')}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'training' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
                >
                <BookOpen size={18} />
                <span>Training</span>
                </button>
                <button
                onClick={() => setCurrentView('reports')}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'reports' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
                >
                <BarChart3 size={18} />
                <span>Manager Reports</span>
                </button>
                <button
                onClick={() => setCurrentView('planograms')}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${currentView === 'planograms' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
                >
                <ClipboardCheck size={18} />
                <span>Planograms</span>
                </button>
            </div>
            </div>
            <div className="flex items-center space-x-4">
            <div className="text-right">
                <div className="font-semibold">{getCurrentTimeString()}</div>
                <div className="text-sm text-blue-200">{getCurrentDateString()}</div>
            </div>
            <button
                onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'es' : 'en')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-700 rounded hover:bg-blue-600"
            >
                <Globe size={18} />
                <span>{currentLanguage === 'en' ? 'ES' : 'EN'}</span>
            </button>
            </div>
        </div>
        </nav>
    );
}

export default NavigationBar;