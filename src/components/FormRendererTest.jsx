import React, { useState, useEffect } from 'react';
import FormRenderer from './FormRenderer';
import { ArrowLeft } from 'lucide-react';
import useStore from '../store';
import { apiRequest } from '../utils/api';

/**
 * FormRendererTest - Test page for FormRenderer component
 * 
 * Fetches a log template from the API and renders it with FormRenderer
 * This verifies that our dynamic form system works with real data
 */
const FormRendererTest = () => {
  const { user } = useStore();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Fetch Equipment Temperatures template (ID: 1)
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = user?.token;
        
        if (!token) {
          setError('Not logged in. Please log in first.');
          setLoading(false);
          return;
        }
        
        const data = await apiRequest('/api/logs/templates/1', token);
        setTemplate(data);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [user?.token]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const token = user?.token;

      const result = await apiRequest('/api/logs/submissions', token, {
        method: 'POST',
        body: JSON.stringify({
          log_template_id: 1,
          form_data: formData,
        }),
      });

      setSubmitResult({ success: true, data: result });
      alert('✅ Form submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitResult({ success: false, error: err.message });
      alert(`❌ Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading template...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Template</h3>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Make sure you're logged in and the server is running on port 3002
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          FormRenderer Test
        </h1>
        <p className="text-gray-600">
          Testing dynamic form rendering with: <strong>{template?.name}</strong>
        </p>
      </div>

      {/* Template Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Template Details</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-blue-700">ID:</dt>
          <dd className="text-blue-900">{template?.id}</dd>
          
          <dt className="text-blue-700">Category:</dt>
          <dd className="text-blue-900">{template?.category}</dd>
          
          <dt className="text-blue-700">Frequency:</dt>
          <dd className="text-blue-900">{template?.frequency}</dd>
          
          <dt className="text-blue-700">Version:</dt>
          <dd className="text-blue-900">{template?.version}</dd>
        </dl>
      </div>

      {/* FormRenderer */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {template?.form_schema && (
          <FormRenderer
            schema={template.form_schema}
            uiSchema={template.ui_schema || {}}
            defaultValues={{}}
            onSubmit={handleSubmit}
            submitLabel="Submit Log"
            loading={submitting}
          />
        )}
      </div>

      {/* Submission Result */}
      {submitResult && (
        <div className={`mt-6 p-4 rounded-lg border ${
          submitResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            submitResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {submitResult.success ? '✅ Submission Successful' : '❌ Submission Failed'}
          </h3>
          <pre className="text-xs overflow-auto p-2 bg-white rounded">
            {JSON.stringify(submitResult.success ? submitResult.data : submitResult.error, null, 2)}
          </pre>
        </div>
      )}

      {/* Schema Preview (for debugging) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          View JSON Schema (for debugging)
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">form_schema:</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-96">
              {JSON.stringify(template?.form_schema, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">ui_schema:</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-96">
              {JSON.stringify(template?.ui_schema, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
};

export default FormRendererTest;
