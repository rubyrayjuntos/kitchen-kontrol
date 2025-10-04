
import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import useStore from '../store';

const TrainingView = () => {
    const {
        trainingModules,
        setCurrentView
    } = useStore();

  const [selectedTraining, setSelectedTraining] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});

  const handleStartTraining = (moduleId) => {
    setSelectedTraining(moduleId);
    setUserProgress(prev => ({
      ...prev,
      [moduleId]: { started: true, completed: false, currentSection: 0 }
    }));
  };

  const handleCompleteSection = (moduleId, sectionIndex) => {
    setUserProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        currentSection: sectionIndex + 1
      }
    }));
  };

  const handleQuizAnswer = (moduleId, questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${moduleId}-${questionIndex}`]: answerIndex
    }));
  };

  const handleCompleteTraining = (moduleId) => {
    setUserProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        completed: true,
        completedDate: new Date().toLocaleDateString()
      }
    }));
    setSelectedTraining(null);
  };

  const calculateQuizScore = (moduleId) => {
    const module = trainingModules.find(m => m.id === moduleId);
    if (!module || !module.content.quiz) return 0;
    
    let correct = 0;
    module.content.quiz.forEach((question, index) => {
      const userAnswer = quizAnswers[`${moduleId}-${index}`];
      if (userAnswer === question.correct) correct++;
    });
    
    return Math.round((correct / module.content.quiz.length) * 100);
  };

  if (selectedTraining) {
    const module = trainingModules.find(m => m.id === selectedTraining);
    const progress = userProgress[selectedTraining] || { currentSection: 0 };
    const isQuizSection = progress.currentSection >= module.content.sections.length;

    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{module.title}</h1>
              <p className="text-gray-600">{module.description}</p>
            </div>
            <button
              onClick={() => setSelectedTraining(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Training
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(((progress.currentSection) / (module.content.sections.length + 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((progress.currentSection) / (module.content.sections.length + 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {!isQuizSection ? (
            /* Content Section */
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {module.content.sections[progress.currentSection].title}
                </h3>
                <p className="text-gray-700 mb-4">
                  {module.content.sections[progress.currentSection].content}
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {module.content.sections[progress.currentSection].keyPoints.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => handleCompleteSection(selectedTraining, progress.currentSection - 1)}
                  disabled={progress.currentSection === 0}
                  className={`px-4 py-2 rounded ${
                    progress.currentSection === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handleCompleteSection(selectedTraining, progress.currentSection)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {progress.currentSection === module.content.sections.length - 1 ? 'Take Quiz' : 'Next'}
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Section */
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Knowledge Check</h3>
                <div className="space-y-6">
                  {module.content.quiz.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-3">
                      <p className="font-medium">
                        {qIndex + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label key={oIndex} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={oIndex}
                              onChange={() => handleQuizAnswer(selectedTraining, qIndex, oIndex)}
                              className="text-blue-600"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => handleCompleteTraining(selectedTraining)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Training
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Training Center</h1>
      
      {/* Training Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(trainingModules ?? []).map((module) => {
          const progress = userProgress[module.id];
          const isCompleted = progress?.completed;
          const isStarted = progress?.started;
          
          return (
            <div key={module.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{module.title}</h3>
                <div className="flex items-center space-x-2">
                  {module.required && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Required</span>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="text-green-600" size={20} />
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{module.description}</p>
              <p className="text-gray-500 text-xs mb-4">Duration: {module.duration}</p>
              
              {isCompleted && (
                <div className="mb-4 p-2 bg-green-50 rounded text-sm">
                  <div className="text-green-700">
                    ✓ Completed on {progress.completedDate}
                  </div>
                  <div className="text-green-600">
                    Quiz Score: {calculateQuizScore(module.id)}%
                  </div>
                </div>
              )}
              
              <button
                onClick={() => handleStartTraining(module.id)}
                className={`w-full py-2 px-4 rounded font-medium ${
                  isCompleted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : isStarted
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCompleted ? 'Review Training' : isStarted ? 'Continue Training' : 'Start Training'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Training Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Training Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Object.values(userProgress).filter(p => p.completed).length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {Object.values(userProgress).filter(p => p.started && !p.completed).length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {(trainingModules ?? []).length - Object.keys(userProgress).length}
            </div>
            <div className="text-gray-600">Not Started</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingView;
