import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Leaf, Briefcase, Sun } from 'lucide-react';

const THEMES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Dark slate with blue-grey accents',
    icon: Briefcase,
    colors: {
      primary: '#263238',
      accent: '#607d8b',
      highlight: '#4caf50'
    }
  },
  {
    id: 'serene',
    name: 'Serene',
    description: 'Forest green with natural tones',
    icon: Leaf,
    colors: {
      primary: '#2d4a3e',
      accent: '#7fb069',
      highlight: '#4ade80'
    }
  },
  {
    id: 'mystical',
    name: 'Mystical',
    description: 'Deep purple with cosmic vibes',
    icon: Sparkles,
    colors: {
      primary: '#2d1b69',
      accent: '#9c27b0',
      highlight: '#03dac6'
    }
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Light and warm sunshine tones',
    icon: Sun,
    colors: {
      primary: '#fff8e1',
      accent: '#ff9800',
      highlight: '#4caf50'
    }
  }
];

const ThemeChooser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('professional');
  const dropdownRef = useRef(null);

  // Get current theme from document
  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme') || 'professional';
    setCurrentTheme(theme);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId);
    setCurrentTheme(themeId);
    localStorage.setItem('preferred-theme', themeId);
    setIsOpen(false);
  };

  const currentThemeData = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const CurrentIcon = currentThemeData.icon;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
          padding: 'var(--spacing-2) var(--spacing-3)',
          position: 'relative'
        }}
        aria-label="Choose theme"
        aria-expanded={isOpen}
      >
        <Palette size={18} className="text-accent" />
        <CurrentIcon size={16} />
        <span style={{ fontSize: 'var(--font-size-sm)' }}>Theme</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="neumorphic-raised"
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--spacing-2))',
            right: 0,
            minWidth: '320px',
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-md)',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <div style={{ 
            marginBottom: 'var(--spacing-3)', 
            paddingBottom: 'var(--spacing-2)',
            borderBottom: '1px solid var(--border-secondary)'
          }}>
            <h3 style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <Palette size={16} className="text-accent" />
              Choose Your Theme
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              const isSelected = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`neumorphic-inset ${isSelected ? 'neumorphic-accent' : ''}`}
                  style={{
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)'
                  }}
                >
                  {/* Color Preview Swatches */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 'var(--spacing-1)',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: '32px',
                      height: '12px',
                      backgroundColor: theme.colors.primary,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-primary)'
                    }} />
                    <div style={{
                      width: '32px',
                      height: '12px',
                      backgroundColor: theme.colors.accent,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-primary)'
                    }} />
                    <div style={{
                      width: '32px',
                      height: '12px',
                      backgroundColor: theme.colors.highlight,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-primary)'
                    }} />
                  </div>

                  {/* Theme Icon */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    flexShrink: 0
                  }}>
                    <Icon size={20} className="text-accent" />
                  </div>

                  {/* Theme Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: '600',
                      marginBottom: 'var(--spacing-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}>
                      {theme.name}
                      {isSelected && (
                        <Check size={14} className="text-success" />
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: 'var(--text-secondary)',
                      lineHeight: '1.3'
                    }}>
                      {theme.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ 
            marginTop: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-3)',
            borderTop: '1px solid var(--border-secondary)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            Theme preference saved automatically
          </div>
        </div>
      )}

      {/* Add slide-down animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeChooser;
