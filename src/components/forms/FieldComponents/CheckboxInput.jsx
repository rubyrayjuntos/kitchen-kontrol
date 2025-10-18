import React from 'react';

/**
 * CheckboxInput - Boolean checkbox field
 * Used for: completion flags (soap_stocked, sanitizer_present), USDA components
 */
const CheckboxInput = ({ 
  name, 
  label, 
  value, 
  onChange, 
  error, 
  description 
}) => {
  return (
    <div className="mb-4">
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 mr-3 text-blue-600 focus:ring-blue-500 h-4 w-4"
        />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </label>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 ml-7">{error.message}</p>
      )}
    </div>
  );
};

export default CheckboxInput;
