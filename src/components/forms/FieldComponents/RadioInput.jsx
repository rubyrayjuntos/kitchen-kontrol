import React from 'react';

/**
 * RadioInput - Radio button group for enum values
 * Used for: check_time (morning/afternoon), yes/no choices
 */
const RadioInput = ({ 
  name, 
  label, 
  value, 
  onChange, 
  error, 
  required,
  options,
  description 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      
      <div className="space-y-2">
        {options?.map((option) => (
          <label key={option} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 capitalize">{option}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default RadioInput;
