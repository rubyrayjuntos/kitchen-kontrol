import React from 'react';

/**
 * NumberInput - Numeric input field with min/max constraints
 * Used for: temperatures, counts, quantities
 */
const NumberInput = ({ 
  name, 
  label, 
  value, 
  onChange, 
  error, 
  placeholder, 
  required,
  minimum,
  maximum,
  description 
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
      
      <input
        type="number"
        id={name}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder}
        min={minimum}
        max={maximum}
        step="0.1"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      
      {(minimum !== undefined || maximum !== undefined) && !error && (
        <p className="mt-1 text-xs text-gray-500">
          {minimum !== undefined && maximum !== undefined 
            ? `Range: ${minimum} - ${maximum}`
            : minimum !== undefined 
              ? `Min: ${minimum}`
              : `Max: ${maximum}`
          }
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default NumberInput;
