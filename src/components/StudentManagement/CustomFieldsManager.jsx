import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCog } from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../../services/studentApiService';

const CustomFieldsManager = () => {
  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    label: '',
    field_type: 'text',
    is_required: false,
    help_text: '',
    default_value: '',
    choices: '',
    validation_regex: '',
    min_value: '',
    max_value: '',
    is_active: true,
    order: '',
    options: '', // backward compatibility
    description: ''
  });
  const [valueForm, setValueForm] = useState({
    student_id: '',
    custom_field_id: '',
    value: ''
  });

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const modalOpen = showFieldModal || showValueModal;
    if (modalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showFieldModal, showValueModal]);

  useEffect(() => {
    loadFields();
    loadFieldValues();
  }, []);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await studentApiService.getCustomFields();
      setFields(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFieldValues = async () => {
    try {
      const data = await studentApiService.getCustomFieldValues();
      setFieldValues(data.results || data);
    } catch (err) {
      console.error('Error loading field values:', err);
    }
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await studentApiService.updateCustomField(editingField.id, fieldForm);
      } else {
        await studentApiService.createCustomField(fieldForm);
      }
      setShowFieldModal(false);
      setEditingField(null);
      resetFieldForm();
      loadFields();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleValueSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingValue) {
        await studentApiService.updateCustomFieldValue(editingValue.id, valueForm);
      } else {
        await studentApiService.createCustomFieldValue(valueForm);
      }
      setShowValueModal(false);
      setEditingValue(null);
      resetValueForm();
      loadFieldValues();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFieldEdit = (field) => {
    setEditingField(field);
    setFieldForm({
      name: field.name || '',
      label: field.label || '',
      field_type: field.field_type || 'text',
      is_required: field.is_required || false,
      help_text: field.help_text || field.description || '',
      default_value: field.default_value || '',
      choices: Array.isArray(field.choices) ? JSON.stringify(field.choices) : (field.choices || ''),
      validation_regex: field.validation_regex || '',
      min_value: field.min_value ?? '',
      max_value: field.max_value ?? '',
      is_active: field.is_active ?? true,
      order: field.order ?? '',
      options: field.options || '',
      description: field.description || ''
    });
    setShowFieldModal(true);
  };

  const handleFieldDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      try {
        await studentApiService.deleteCustomField(id);
        loadFields();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      label: '',
      field_type: 'text',
      is_required: false,
      help_text: '',
      default_value: '',
      choices: '',
      validation_regex: '',
      min_value: '',
      max_value: '',
      is_active: true,
      order: '',
      options: '',
      description: ''
    });
  };

  const resetValueForm = () => {
    setValueForm({
      student_id: '',
      custom_field_id: '',
      value: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Custom Fields Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowFieldModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Field
          </button>
          <button
            onClick={() => setShowValueModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Value
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Fields */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Custom Fields</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{field.name}</h4>
                        <p className="text-sm text-gray-600">{field.field_type}</p>
                        {field.description && (
                          <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFieldEdit(field)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleFieldDelete(field.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Field Values */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Field Values</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {fieldValues.map((value) => (
                <div key={value.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{value.custom_field?.name}</h4>
                      <p className="text-sm text-gray-600">Student ID: {value.student_id}</p>
                      <p className="text-sm text-gray-800 mt-1">{value.value}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold">
                {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
              </h3>
              <button onClick={() => { setShowFieldModal(false); setEditingField(null); resetFieldForm(); }} className="px-3 py-1 border rounded">Close</button>
            </div>
            <div className="px-6 py-4">
            <form onSubmit={handleFieldSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({...fieldForm, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Label</label>
                <input
                  type="text"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({...fieldForm, label: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Field type</label>
                <select
                  value={fieldForm.field_type}
                  onChange={(e) => setFieldForm({...fieldForm, field_type: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="multiselect">Multi-Select</option>
                  <option value="textarea">Textarea</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={fieldForm.is_required}
                  onChange={(e) => setFieldForm({...fieldForm, is_required: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_required" className="text-sm font-medium text-gray-700">
                  Required
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Help text</label>
                <textarea
                  value={fieldForm.help_text}
                  onChange={(e) => setFieldForm({...fieldForm, help_text: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default value</label>
                <input
                  type="text"
                  value={fieldForm.default_value}
                  onChange={(e) => setFieldForm({...fieldForm, default_value: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Choices</label>
                <textarea
                  value={fieldForm.choices}
                  onChange={(e) => setFieldForm({...fieldForm, choices: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder='["Option 1", "Option 2"]'
                />
                <p className="text-xs text-gray-500 mt-1">For select/multiselect, provide options as JSON array</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Validation regex</label>
                <input
                  type="text"
                  value={fieldForm.validation_regex}
                  onChange={(e) => setFieldForm({...fieldForm, validation_regex: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="^\\d{12}$"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min value</label>
                  <input
                    type="number"
                    value={fieldForm.min_value}
                    onChange={(e) => setFieldForm({...fieldForm, min_value: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max value</label>
                  <input
                    type="number"
                    value={fieldForm.max_value}
                    onChange={(e) => setFieldForm({...fieldForm, max_value: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={fieldForm.is_active}
                  onChange={(e) => setFieldForm({...fieldForm, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Is active</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  value={fieldForm.order}
                  onChange={(e) => setFieldForm({...fieldForm, order: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={fieldForm.description}
                  onChange={(e) => setFieldForm({...fieldForm, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFieldModal(false);
                    setEditingField(null);
                    resetFieldForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingField ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Value Modal */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingValue ? 'Edit Field Value' : 'Add Field Value'}
            </h3>
            <form onSubmit={handleValueSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input
                  type="number"
                  value={valueForm.student_id}
                  onChange={(e) => setValueForm({...valueForm, student_id: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Field</label>
                <select
                  value={valueForm.custom_field_id}
                  onChange={(e) => setValueForm({...valueForm, custom_field_id: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Field</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="text"
                  value={valueForm.value}
                  onChange={(e) => setValueForm({...valueForm, value: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowValueModal(false);
                    setEditingValue(null);
                    resetValueForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingValue ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsManager;
