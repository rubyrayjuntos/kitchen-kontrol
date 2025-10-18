import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Save, AlertCircle } from 'lucide-react';
import {
  TextInput,
  NumberInput,
  SelectInput,
  RadioInput,
  CheckboxInput,
  TextareaInput,
  DateInput,
} from './fields';

// Initialize Ajv validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * FormRenderer - Generic dynamic form component
 * 
 * Renders any form based on JSON Schema (form_schema) and UI hints (ui_schema)
 * Uses React Hook Form for state management and Ajv for validation
 * 
 * Props:
 * - schema: JSON Schema object defining form structure and validation
 * - uiSchema: UI hints object (optional) - specifies widgets, order, placeholders
 * - defaultValues: Initial form data (optional)
 * - onSubmit: Callback function receiving validated form data
 * - onCancel: Callback function for cancel action (optional)
 * - submitLabel: Custom submit button text (default: "Submit")
 * - loading: Show loading state on submit button
 */
const FormRenderer = ({
  schema,
  uiSchema = {},
  defaultValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  loading = false,
}) => {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues,
    mode: 'onChange', // Validate on change for better UX
  });

  // Ajv validation resolver
  const validateWithAjv = (data) => {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      // Convert Ajv errors to React Hook Form error format
      const formErrors = {};
      validate.errors?.forEach((error) => {
        const fieldName = error.instancePath.slice(1).replace(/\//g, '.') || error.params.missingProperty;
        if (fieldName) {
          formErrors[fieldName] = {
            type: error.keyword,
            message: error.message || 'Validation error',
          };
        }
      });
      return formErrors;
    }

    return {};
  };

  // Submit handler with Ajv validation
  const onFormSubmit = (data) => {
    const validationErrors = validateWithAjv(data);

    if (Object.keys(validationErrors).length > 0) {
      console.error('Validation errors:', validationErrors);
      // In production, you might want to display these errors
      return;
    }

    onSubmit(data);
  };

  /**
   * Field Factory - Maps JSON Schema types to React components
   * 
   * Determines which field component to render based on:
   * 1. ui_schema widget hint (highest priority)
   * 2. JSON Schema enum (radio/select for small/large enums)
   * 3. JSON Schema type (string → text, number → number, boolean → checkbox)
   */
  const renderField = (fieldName, fieldSchema) => {
    const uiHints = uiSchema[fieldName] || {};
    const widget = uiHints['ui:widget'];

    // CHECKBOX - Boolean fields
    if (fieldSchema.type === 'boolean' || widget === 'checkbox') {
      return CheckboxInput;
    }

    // RADIO - Small enum (≤ 4 options)
    if (fieldSchema.enum && fieldSchema.enum.length <= 4 && widget !== 'select') {
      return (props) => (
        <RadioInput {...props} options={fieldSchema.enum} />
      );
    }

    // SELECT - Large enum or explicit widget
    if (fieldSchema.enum || widget === 'select') {
      return (props) => (
        <SelectInput {...props} options={fieldSchema.enum || []} />
      );
    }

    // TEXTAREA - Explicit widget or long text
    if (widget === 'textarea' || (fieldSchema.type === 'string' && fieldSchema.maxLength > 200)) {
      return (props) => (
        <TextareaInput
          {...props}
          minLength={fieldSchema.minLength}
          maxLength={fieldSchema.maxLength}
        />
      );
    }

    // NUMBER INPUT
    if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
      return (props) => (
        <NumberInput
          {...props}
          minimum={fieldSchema.minimum}
          maximum={fieldSchema.maximum}
        />
      );
    }

    // DATE INPUT
    if (widget === 'date' || fieldSchema.format === 'date') {
      return DateInput;
    }

    // TEXT INPUT (default for strings)
    return (props) => (
      <TextInput
        {...props}
        minLength={fieldSchema.minLength}
        maxLength={fieldSchema.maxLength}
      />
    );
  };

  // Get field order from ui_schema or use schema order
  const getFieldOrder = () => {
    if (uiSchema['ui:order']) {
      return uiSchema['ui:order'];
    }
    return Object.keys(schema.properties || {});
  };

  const fieldOrder = getFieldOrder();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Schema title and description */}
      {schema.title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {schema.title}
        </h3>
      )}
      {schema.description && (
        <p className="text-sm text-gray-600 mb-4">{schema.description}</p>
      )}

      {/* Render fields in specified order */}
      {fieldOrder.map((fieldName) => {
        const fieldSchema = schema.properties?.[fieldName];
        
        if (!fieldSchema) return null;

        const FieldComponent = renderField(fieldName, fieldSchema);
        const required = schema.required?.includes(fieldName);
        const uiHints = uiSchema[fieldName] || {};

        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: required ? `${fieldSchema.title || fieldName} is required` : false }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FieldComponent
                name={fieldName}
                label={fieldSchema.title || fieldName}
                description={fieldSchema.description}
                value={value}
                onChange={onChange}
                error={error}
                required={required}
                placeholder={uiHints['ui:placeholder']}
              />
            )}
          />
        );
      })}

      {/* Global form errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {schema.properties?.[field]?.title || field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading || !isDirty}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition-colors ${
            loading || !isDirty
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default FormRenderer;
