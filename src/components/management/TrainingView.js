
import React, { useState } from 'react';
import { CheckCircle2, GraduationCap, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../../store';

const TrainingView = () => {
    const {
      trainingModules
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
      <div style={{ padding: 'var(--spacing-6)' }}>
        <div className="card-lg" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
            <div>
              <h1 className="text-2xl font-bold text-neumorphic-embossed">{module.title}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{module.description}</p>
            </div>
            <button
              onClick={() => setSelectedTraining(null)}
              className="btn btn-ghost"
            >
              <ArrowLeft size={16} style={{ marginRight: 'var(--spacing-2)' }} />
              Back to Training
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <div className="d-flex justify-between" style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-1)'
            }}>
              <span>Progress</span>
              <span>{Math.round(((progress.currentSection) / (module.content.sections.length + 1)) * 100)}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--primary)', 
                  borderRadius: 'var(--radius-full)',
                  width: `${((progress.currentSection) / (module.content.sections.length + 1)) * 100}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
          </div>

          {!isQuizSection ? (
            /* Content Section */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div className="neumorphic-inset" style={{ 
                padding: 'var(--spacing-6)', 
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--primary)'
              }}>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--spacing-4)' }}>
                  {module.content.sections[progress.currentSection].title}
                </h3>
                <p style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: 'var(--spacing-4)',
                  lineHeight: '1.6'
                }}>
                  {module.content.sections[progress.currentSection].content}
                </p>
                <div>
                  <h4 className="font-semibold" style={{ marginBottom: 'var(--spacing-2)' }}>Key Points:</h4>
                  <ul style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--spacing-1)',
                    listStyle: 'disc',
                    listStylePosition: 'inside'
                  }}>
                    {module.content.sections[progress.currentSection].keyPoints.map((point, index) => (
                      <li key={index} style={{ color: 'var(--text-primary)' }}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="d-flex justify-between">
                <button
                  onClick={() => handleCompleteSection(selectedTraining, progress.currentSection - 1)}
                  disabled={progress.currentSection === 0}
                  className="btn btn-ghost"
                  style={{
                    opacity: progress.currentSection === 0 ? 0.5 : 1,
                    cursor: progress.currentSection === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16} style={{ marginRight: 'var(--spacing-1)' }} />
                  Previous
                </button>
                <button
                  onClick={() => handleCompleteSection(selectedTraining, progress.currentSection)}
                  className="btn btn-primary"
                >
                  {progress.currentSection === module.content.sections.length - 1 ? 'Take Quiz' : 'Next'}
                  <ChevronRight size={16} style={{ marginLeft: 'var(--spacing-1)' }} />
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Section */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div className="neumorphic-inset" style={{ 
                padding: 'var(--spacing-6)', 
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--success)'
              }}>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--spacing-4)' }}>Knowledge Check</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                  {module.content.quiz.map((question, qIndex) => (
                    <div key={qIndex} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                      <p className="font-medium">
                        {qIndex + 1}. {question.question}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                        {question.options.map((option, oIndex) => (
                          <label key={oIndex} className="d-flex items-center gap-2" style={{ cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={oIndex}
                              onChange={() => handleQuizAnswer(selectedTraining, qIndex, oIndex)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="d-flex justify-center">
                <button
                  onClick={() => handleCompleteTraining(selectedTraining)}
                  className="btn btn-success btn-lg"
                  style={{ padding: 'var(--spacing-3) var(--spacing-6)' }}
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
    <div style={{ padding: 'var(--spacing-6)' }}>
      <h1 className="text-neumorphic-embossed" style={{ 
        fontSize: 'var(--font-size-2xl)', 
        fontWeight: '700',
        marginBottom: 'var(--spacing-6)' 
      }}>
        Training Center
      </h1>
      
      {/* Training Overview */}
      <div className="demo-grid" style={{ marginBottom: 'var(--spacing-8)' }}>
        {(trainingModules ?? []).map((module) => {
          const progress = userProgress[module.id];
          const isCompleted = progress?.completed;
          const isStarted = progress?.started;
          
          return (
            <div key={module.id} className="neumorphic-raised" style={{ padding: 'var(--spacing-6)' }}>
              <div className="d-flex items-center justify-between" style={{ marginBottom: 'var(--spacing-2)' }}>
                <h3 className="font-semibold">{module.title}</h3>
                <div className="d-flex items-center gap-2">
                  {module.required && (
                    <span className="badge badge-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                      Required
                    </span>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="text-success" size={20} />
                  )}
                </div>
              </div>
              
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: 'var(--font-size-sm)', 
                marginBottom: 'var(--spacing-3)' 
              }}>
                {module.description}
              </p>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: 'var(--font-size-xs)', 
                marginBottom: 'var(--spacing-4)' 
              }}>
                Duration: {module.duration}
              </p>
              
              {isCompleted && (
                <div className="neumorphic-inset" style={{ 
                  marginBottom: 'var(--spacing-4)', 
                  padding: 'var(--spacing-2)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <div className="text-success">
                    ✓ Completed on {progress.completedDate}
                  </div>
                  <div className="text-success">
                    Quiz Score: {calculateQuizScore(module.id)}%
                  </div>
                </div>
              )}
              
              <button
                onClick={() => handleStartTraining(module.id)}
                className={`btn ${
                  isCompleted
                    ? 'btn-success'
                    : isStarted
                    ? 'btn-accent'
                    : 'btn-primary'
                }`}
                style={{ width: '100%', fontWeight: '500' }}
              >
                <GraduationCap size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                {isCompleted ? 'Review Training' : isStarted ? 'Continue Training' : 'Start Training'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Training Statistics */}
      <div className="card-lg">
        <h2 className="text-xl font-bold text-neumorphic-embossed" style={{ marginBottom: 'var(--spacing-4)' }}>
          Training Progress
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--spacing-6)' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              {Object.values(userProgress).filter(p => p.completed).length}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>
              {Object.values(userProgress).filter(p => p.started && !p.completed).length}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>In Progress</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-secondary)' }}>
              {(trainingModules ?? []).length - Object.keys(userProgress).length}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Not Started</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingView;
