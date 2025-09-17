import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faPaperPlane,
  faUserPlus, faCopy, faArrowsRotate, faEnvelopeOpen, faEnvelopeOpenText,
  faClock, faCheck, faTimes, faSpinner
} from "@fortawesome/free-solid-svg-icons";
const EmailManager = ({ students, onClose }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailDomain, setEmailDomain] = useState("@student.edu");
  const [emailPattern, setEmailPattern] = useState("ROLLNO");
  const [showEmailHistory, setShowEmailHistory] = useState(false);
  const [bulkAction, setBulkAction] = useState("send");
  const [emailStatus, setEmailStatus] = useState({});

  // Email templates
  const defaultTemplates = [
    {
      id: "welcome",
      name: "Welcome Email",
      subject: "Welcome to {INSTITUTION_NAME}",
      body: `Dear {STUDENT_NAME},

Welcome to {INSTITUTION_NAME}! We're excited to have you join our academic community.

Your login credentials:
Username: {USERNAME}
Password: {PASSWORD}
Email: {EMAIL}

Please log in to your student portal and complete your profile.

Best regards,
{INSTITUTION_NAME} Team`
    },
    {
      id: "credentials",
      name: "Login Credentials",
      subject: "Your Login Credentials - {INSTITUTION_NAME}",
      body: `Dear {STUDENT_NAME},

Here are your login credentials for the student portal:

Username: {USERNAME}
Password: {PASSWORD}
Email: {EMAIL}

Please keep these credentials secure and change your password after first login.

Best regards,
{INSTITUTION_NAME} Team`
    },
    {
      id: "reminder",
      name: "General Reminder",
      subject: "Important Reminder - {INSTITUTION_NAME}",
      body: `Dear {STUDENT_NAME},

This is a reminder about important information regarding your academic journey at {INSTITUTION_NAME}.

Please check your student portal regularly for updates.

Best regards,
{INSTITUTION_NAME} Team`
    },
    {
      id: "custom",
      name: "Custom Email",
      subject: "",
      body: ""
    }
  ];

  useEffect(() => {
    setEmailTemplates(defaultTemplates);
  }, []);

  // Email patterns
  const emailPatterns = [
    { id: "ROLLNO", name: "Roll Number", description: "rollno@domain.com" },
    { id: "NAME-ROLLNO", name: "Name + Roll No", description: "name.rollno@domain.com" },
    { id: "FIRSTNAME-LASTNAME", name: "First Name + Last Name", description: "firstname.lastname@domain.com" },
    { id: "CUSTOM", name: "Custom Pattern", description: "Define your own pattern" }
  ];

  // Generate email based on pattern
  const generateEmail = (student, pattern) => {
    const rollNo = student.rollNo || "";
    const firstName = (student.firstName || student.name?.split(' ')[0] || "").toLowerCase();
    const lastName = (student.lastName || student.name?.split(' ')[1] || "").toLowerCase();

    switch (pattern) {
      case "ROLLNO":
        return `${rollNo.toLowerCase().replace(/[^a-z0-9]/g, '')}${emailDomain}`;
      case "NAME-ROLLNO":
        return `${firstName}.${rollNo.toLowerCase().replace(/[^a-z0-9]/g, '')}${emailDomain}`;
      case "FIRSTNAME-LASTNAME":
        return `${firstName}.${lastName}${emailDomain}`;
      case "CUSTOM":
        return customEmailPattern
          .replace("{ROLLNO}", rollNo.toLowerCase().replace(/[^a-z0-9]/g, ''))
          .replace("{FIRSTNAME}", firstName)
          .replace("{LASTNAME}", lastName)
          .replace("{DOMAIN}", emailDomain);
      default:
        return `${rollNo.toLowerCase().replace(/[^a-z0-9]/g, '')}${emailDomain}`;
    }
  };

  // Replace placeholders in email template
  const replacePlaceholders = (template, student) => {
    const email = generateEmail(student, emailPattern);
    return template
      .replace(/{STUDENT_NAME}/g, student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim())
      .replace(/{ROLLNO}/g, student.rollNo || "")
      .replace(/{USERNAME}/g, student.username || student.rollNo || "")
      .replace(/{PASSWORD}/g, student.password || "")
      .replace(/{EMAIL}/g, email)
      .replace(/{DEPARTMENT}/g, student.department || "")
      .replace(/{YEAR}/g, student.year || "")
      .replace(/{INSTITUTION_NAME}/g, "Your Institution Name");
  };

  // Load template
  const loadTemplate = (templateId) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setCurrentTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };

  // Send emails to selected students
  const sendEmails = async () => {
    if (!emailSubject || !emailBody) {
      alert("Please enter both subject and body for the email.");
      return;
    }

    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    setIsSending(true);
    const newEmailHistory = [];

    try {
      for (const student of selectedStudents) {
        const personalizedSubject = replacePlaceholders(emailSubject, student);
        const personalizedBody = replacePlaceholders(emailBody, student);
        const email = generateEmail(student, emailPattern);

        // Simulate email sending (replace with actual email service)
        const emailRecord = {
          id: Date.now() + Math.random(),
          studentId: student.id,
          studentName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          email: email,
          subject: personalizedSubject,
          body: personalizedBody,
          status: "sent",
          sentAt: new Date(),
          template: currentTemplate
        };

        newEmailHistory.push(emailRecord);
        setEmailStatus(prev => ({ ...prev, [student.id]: "sent" }));

        // Save to database
        try {
          await addDoc(collection(db, "emailHistory"), {
            ...emailRecord,
            createdAt: serverTimestamp()
          });

          // Update student record
          const studentRef = doc(db, "students", student.id);
          await updateDoc(studentRef, {
            email: email,
            lastEmailSent: new Date(),
            emailVerified: true
          });
        } catch (error) {
          console.error("Error saving email record:", error);
          setEmailStatus(prev => ({ ...prev, [student.id]: "failed" }));
        }

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setEmailHistory(prev => [...newEmailHistory, ...prev]);
      alert("Emails sent successfully!");
      setIsSending(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("Error sending emails. Please try again.");
      setIsSending(false);
    }
  };

  // Export email list to CSV
  const exportToCSV = () => {
    const csvContent = [
      "Name,Roll Number,Email,Department,Year,Email Status",
      ...selectedStudents.map(student => {
        const email = generateEmail(student, emailPattern);
        const status = emailStatus[student.id] || "pending";
        return `"${student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}","${student.rollNo}","${email}","${student.department}","${student.year}","${status}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Save template
  const saveTemplate = () => {
    if (!emailSubject || !emailBody) {
      alert("Please enter both subject and body for the template.");
      return;
    }

    const newTemplate = {
      id: `template_${Date.now()}`,
      name: `Custom Template ${emailTemplates.length + 1}`,
      subject: emailSubject,
      body: emailBody
    };

    setEmailTemplates(prev => [...prev, newTemplate]);
    alert("Template saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faEnvelope} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Email Manager</h2>
            <p className="text-gray-600">Manage student emails and send bulk communications</p>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Pattern</label>
            <select
              value={emailPattern}
              onChange={(e) => setEmailPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {emailPatterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
              ))}
            </select>
          </div>

          {/* Email Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Domain</label>
            <input
              type="text"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              placeholder="@student.edu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Email Template */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Template</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
            <select
              value={currentTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a template...</option>
              {emailTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          {/* Save Template */}
          <div className="flex items-end">
            <button
              onClick={saveTemplate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSave} />
              <span>Save Template</span>
            </button>
          </div>
        </div>

        {/* Email Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email Body */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Enter email body..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available placeholders: {"{STUDENT_NAME}"}, {"{ROLLNO}"}, {"{USERNAME}"}, {"{PASSWORD}"}, {"{EMAIL}"}, {"{DEPARTMENT}"}, {"{YEAR}"}, {"{INSTITUTION_NAME}"}
          </p>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Students ({selectedStudents.length} selected)
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={selectAllStudents}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Select All</span>
            </button>
            <button
              onClick={clearSelection}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faUndo} />
              <span>Clear</span>
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {students.map(student => (
            <div key={student.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => toggleStudentSelection(student.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                </p>
                <p className="text-xs text-gray-500">
                  {generateEmail(student, emailPattern)}
                </p>
                <p className="text-xs text-gray-400">
                  {student.department} • {student.year}
                </p>
              </div>
              {emailStatus[student.id] && (
                <div className="flex-shrink-0">
                  {emailStatus[student.id] === "sent" && (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
                  )}
                  {emailStatus[student.id] === "failed" && (
                    <FontAwesomeIcon icon={faTimes} className="text-red-500 text-sm" />
                  )}
                  {emailStatus[student.id] === "sending" && (
                    <FontAwesomeIcon icon={faSpinner} className="text-blue-500 text-sm animate-spin" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Send Emails */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Send Emails</h3>
          <button
            onClick={() => setShowEmailHistory(!showEmailHistory)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showEmailHistory ? 'Hide' : 'Show'} Email History
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={sendEmails}
            disabled={isSending || selectedStudents.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            <span>{isSending ? 'Sending...' : `Send to ${selectedStudents.length} Students`}</span>
          </button>

          <button
            onClick={() => setShowEmailHistory(!showEmailHistory)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faHistory} />
            <span>Email History</span>
          </button>
        </div>
      </div>

      {/* Email History */}
      {showEmailHistory && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email History</h3>
          
          {emailHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No email history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailHistory.slice(0, 10).map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.studentName}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{email.email}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{email.subject}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          email.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <FontAwesomeIcon icon={email.status === 'sent' ? faCheckCircle : faTimes} className="mr-1" />
                          {email.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {email.sentAt.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Template Examples */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultTemplates.slice(0, 3).map(template => (
            <div key={template.id} className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-3">{template.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailManager;
