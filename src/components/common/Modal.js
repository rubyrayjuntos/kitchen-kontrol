import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen = true, onClose, title, children }) => {
    useEffect(() => {
      if (isOpen) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div 
        className="modal-backdrop" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: 'var(--spacing-4)',
        }}
        onClick={onClose}
      >
        <div 
          className="card-lg neumorphic-raised" 
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            animation: 'modalSlideIn 0.3s ease-out',
          }}
        > 
          <div 
            className="d-flex justify-between items-center" 
            style={{ 
              padding: 'var(--spacing-5)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <h3 
              id="modal-title" 
              className="text-xl font-bold text-neumorphic-embossed"
            >
              {title}
            </h3>
            <button 
              onClick={onClose} 
              className="btn btn-ghost btn-circular" 
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: 'var(--spacing-5)' }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  export default Modal;