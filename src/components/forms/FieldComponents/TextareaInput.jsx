import React from 'react';

/**
 * TextareaInput - Multi-line text area
 * Used for: corrective_action, notes, detailed descriptions
 */
const TextareaInput = ({ 
  name, 
  label, 
  value, 
  onChange, 
  error, 
  placeholder, 
  required,
  minLength,
  maxLength,
  description,
  rows = 3
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {(value?.length || 0)}/{maxLength}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default TextareaInput;
