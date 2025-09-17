// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faSave, faTimes, faPlus, faTrash, faEdit,
  faUniversity, faUserShield, faBell, faPalette,
  faDatabase, faShieldAlt, faEnvelope, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      institutionName: 'University Management System',
      institutionCode: 'UMS001',
      academicYear: '2024-2025',
      semester: '1st Semester',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      language: 'English',
      currency: 'INR',
      maxFileSize: 5,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx']
    },
    academic: {
      gradingSystem: 'CGPA',
      maxCGPA: 10,
      passPercentage: 40,
      attendanceRequirement: 75,
      maxBacklogs: 8,
      creditSystem: true,
      semesterDuration: 6,
      examSchedule: {
        midSemester: true,
        endSemester: true,
        practical: true
      }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationTypes: {
        feeReminder: true,
        attendanceAlert: true,
        examSchedule: true,
        resultDeclaration: true,
        generalAnnouncement: true
      },
      reminderFrequency: 'weekly',
      autoReminders: true
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      ipWhitelist: [],
      auditLogging: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      fontFamily: 'Inter',
      fontSize: 'medium',
      sidebarCollapsed: false,
      showAnimations: true,
      compactMode: false
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retentionDays: 30,
      cloudBackup: false,
      backupLocation: 'local',
      compressionEnabled: true
    }
  });

  // Fetch settings from Firebase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'systemSettings', 'main'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        } else {
          // Create default settings if they don't exist
          await setDoc(doc(db, 'systemSettings', 'main'), {
            ...settings,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'systemSettings', 'main'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Update specific setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Update nested setting
  const updateNestedSetting = (category, parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [childKey]: value
        }
      }
    }));
  };

  // Settings tabs
  const tabs = [
    { id: 'general', name: 'General', icon: faUniversity },
    { id: 'academic', name: 'Academic', icon: faGraduationCap },
    { id: 'notifications', name: 'Notifications', icon: faBell },
    { id: 'security', name: 'Security', icon: faShieldAlt },
    { id: 'appearance', name: 'Appearance', icon: faPalette },
    { id: 'backup', name: 'Backup', icon: faDatabase }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={saving ? faCog : faSave} className={saving ? 'animate-spin' : ''} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={settings.general.institutionName}
                    onChange={(e) => updateSetting('general', 'institutionName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution Code</label>
                  <input
                    type="text"
                    value={settings.general.institutionCode}
                    onChange={(e) => updateSetting('general', 'institutionCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={settings.general.academicYear}
                    onChange={(e) => updateSetting('general', 'academicYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                  <select
                    value={settings.general.semester}
                    onChange={(e) => updateSetting('general', 'semester', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Academic Settings */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Academic Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
                  <select
                    value={settings.academic.gradingSystem}
                    onChange={(e) => updateSetting('academic', 'gradingSystem', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CGPA">CGPA (10 Point)</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Letter">Letter Grade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum CGPA</label>
                  <input
                    type="number"
                    value={settings.academic.maxCGPA}
                    onChange={(e) => updateSetting('academic', 'maxCGPA', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pass Percentage</label>
                  <input
                    type="number"
                    value={settings.academic.passPercentage}
                    onChange={(e) => updateSetting('academic', 'passPercentage', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Requirement (%)</label>
                  <input
                    type="number"
                    value={settings.academic.attendanceRequirement}
                    onChange={(e) => updateSetting('academic', 'attendanceRequirement', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Backlogs</label>
                  <input
                    type="number"
                    value={settings.academic.maxBacklogs}
                    onChange={(e) => updateSetting('academic', 'maxBacklogs', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester Duration (Months)</label>
                  <input
                    type="number"
                    value={settings.academic.semesterDuration}
                    onChange={(e) => updateSetting('academic', 'semesterDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.academic.creditSystem}
                    onChange={(e) => updateSetting('academic', 'creditSystem', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Credit System</span>
                </label>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable SMS Notifications</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Push Notifications</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.autoReminders}
                      onChange={(e) => updateSetting('notifications', 'autoReminders', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Auto Reminders</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Frequency</label>
                <select
                  value={settings.notifications.reminderFrequency}
                  onChange={(e) => updateSetting('notifications', 'reminderFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Notification Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.notifications.notificationTypes).map(([key, value]) => (
                    <div key={key}>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSetting('notifications', 'notificationTypes', key, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                  <input
                    type="number"
                    value={settings.security.passwordPolicy.minLength}
                    onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require Uppercase Letters</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordPolicy.requireLowercase}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require Lowercase Letters</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require Numbers</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordPolicy.requireSpecialChars}
                        onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require Special Characters</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.auditLogging}
                      onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Audit Logging</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Appearance Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                  <select
                    value={settings.appearance.fontFamily}
                    onChange={(e) => updateSetting('appearance', 'fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.appearance.showAnimations}
                      onChange={(e) => updateSetting('appearance', 'showAnimations', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show Animations</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => updateSetting('appearance', 'compactMode', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Compact Mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Backup Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.backup.autoBackup}
                      onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Auto Backup</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.backup.cloudBackup}
                      onChange={(e) => updateSetting('backup', 'cloudBackup', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Cloud Backup</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                  <select
                    value={settings.backup.backupFrequency}
                    onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Backup Time</label>
                  <input
                    type="time"
                    value={settings.backup.backupTime}
                    onChange={(e) => updateSetting('backup', 'backupTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retention Days</label>
                  <input
                    type="number"
                    value={settings.backup.retentionDays}
                    onChange={(e) => updateSetting('backup', 'retentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.backup.compressionEnabled}
                      onChange={(e) => updateSetting('backup', 'compressionEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Compression</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
