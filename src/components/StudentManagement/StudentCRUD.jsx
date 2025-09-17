import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faSearch, faFilter, faDownload, faUpload, faCog, faFileAlt, faHistory, faGraduationCap, faUsers, faDatabase, faBell, faLayerGroup, faIdCard, faList } from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../../services/studentApiService';
import CustomFieldsManager from './CustomFieldsManager';
import DocumentsManager from './DocumentsManager';
import EnrollmentHistoryManager from './EnrollmentHistoryManager';
import ImportOperationsManager from './ImportOperationsManager';

const StudentCRUD = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [showDocumentsManager, setShowDocumentsManager] = useState(false);
  const [showEnrollmentHistory, setShowEnrollmentHistory] = useState(false);
  const [showImportsManager, setShowImportsManager] = useState(false);
  const [showAcademicYears, setShowAcademicYears] = useState(false);
  const [showCastes, setShowCastes] = useState(false);
  const [showQuotas, setShowQuotas] = useState(false);
  const [showReligions, setShowReligions] = useState(false);
  const [showSemesters, setShowSemesters] = useState(false);
  const [showBatches, setShowBatches] = useState(false);
  const [showIdentifiers, setShowIdentifiers] = useState(false);
  const [showCustomFieldValues, setShowCustomFieldValues] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    roll_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    
    // Academic Information
    section: '',
    academic_year: '',
    year_of_study: '1',
    semester: '1',
    quota: '',
    rank: '',
    department: '',
    academic_program: '',
    
    // Contact Information
    email: '',
    student_mobile: '',
    
    // Address Information
    village: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    
    // Identity Information
    aadhar_number: '',
    
    // Religious and Caste Information
    religion: '',
    caste: '',
    subcaste: '',
    
    // Parent Information
    father_name: '',
    mother_name: '',
    father_mobile: '',
    mother_mobile: '',
    
    // Academic Status
    enrollment_date: new Date().toISOString().split('T')[0],
    expected_graduation_date: '',
    status: 'ACTIVE',
    
    // Guardian Information (Legacy)
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relationship: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Medical Information
    medical_conditions: '',
    medications: '',
    
    // Additional Information
    notes: '',
    profile_picture: ''
  });

  useEffect(() => {
    loadStudents();
  }, [searchTerm, statusFilter, departmentFilter, yearFilter, sectionFilter, page, pageSize]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await studentApiService.getStudents({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
        year: yearFilter || undefined,
        section: sectionFilter || undefined,
        page,
        page_size: pageSize,
      });
      setStudents((Array.isArray(data) ? data : (data?.results || data)) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentApiService.updateStudent(editingStudent.id, formData);
      } else {
        await studentApiService.createStudent(formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      // Basic Information
      roll_number: student.roll_number || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      middle_name: student.middle_name || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      
      // Academic Information
      section: student.section || '',
      academic_year: student.academic_year || '',
      year_of_study: student.year_of_study || '1',
      semester: student.semester || '1',
      quota: student.quota || '',
      rank: student.rank || '',
      department: student.department || '',
      academic_program: student.academic_program || '',
      
      // Contact Information
      email: student.email || '',
      student_mobile: student.student_mobile || '',
      
      // Address Information
      village: student.village || '',
      address_line1: student.address_line1 || '',
      address_line2: student.address_line2 || '',
      city: student.city || '',
      state: student.state || '',
      postal_code: student.postal_code || '',
      country: student.country || 'India',
      
      // Identity Information
      aadhar_number: student.aadhar_number || '',
      
      // Religious and Caste Information
      religion: student.religion || '',
      caste: student.caste || '',
      subcaste: student.subcaste || '',
      
      // Parent Information
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      father_mobile: student.father_mobile || '',
      mother_mobile: student.mother_mobile || '',
      
      // Academic Status
      enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
      expected_graduation_date: student.expected_graduation_date || '',
      status: student.status || 'ACTIVE',
      
      // Guardian Information (Legacy)
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || '',
      guardian_relationship: student.guardian_relationship || '',
      
      // Emergency Contact
      emergency_contact_name: student.emergency_contact_name || '',
      emergency_contact_phone: student.emergency_contact_phone || '',
      emergency_contact_relationship: student.emergency_contact_relationship || '',
      
      // Medical Information
      medical_conditions: student.medical_conditions || '',
      medications: student.medications || '',
      
      // Additional Information
      notes: student.notes || '',
      profile_picture: student.profile_picture || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentApiService.deleteStudent(id);
        loadStudents();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      // Basic Information
      roll_number: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      date_of_birth: '',
      gender: '',
      
      // Academic Information
      section: '',
      academic_year: '',
      year_of_study: '1',
      semester: '1',
      quota: '',
      rank: '',
      department: '',
      academic_program: '',
      
      // Contact Information
      email: '',
      student_mobile: '',
      
      // Address Information
      village: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      
      // Identity Information
      aadhar_number: '',
      
      // Religious and Caste Information
      religion: '',
      caste: '',
      subcaste: '',
      
      // Parent Information
      father_name: '',
      mother_name: '',
      father_mobile: '',
      mother_mobile: '',
      
      // Academic Status
      enrollment_date: new Date().toISOString().split('T')[0],
      expected_graduation_date: '',
      status: 'ACTIVE',
      
      // Guardian Information (Legacy)
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      guardian_relationship: '',
      
      // Emergency Contact
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      
      // Medical Information
      medical_conditions: '',
      medications: '',
      
      // Additional Information
      notes: '',
      profile_picture: ''
    });
  };

  const filteredStudents = students.filter(student =>
    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* In-Students quick actions (not tabs) */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button onClick={() => setShowCustomFields(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faCog} className="text-gray-600" />
            <span className="text-sm">Custom Fields</span>
          </button>
          <button onClick={() => setShowDocumentsManager(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-600" />
            <span className="text-sm">Documents</span>
          </button>
          <button onClick={() => setShowEnrollmentHistory(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faHistory} className="text-gray-600" />
            <span className="text-sm">Enrollment History</span>
          </button>
          <button onClick={() => setShowImportsManager(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faUpload} className="text-gray-600" />
            <span className="text-sm">Student Imports</span>
          </button>
          <button onClick={() => setShowAcademicYears(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faGraduationCap} className="text-gray-600" />
            <span className="text-sm">Academic Years</span>
          </button>
          <button onClick={() => setShowCastes(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faUsers} className="text-gray-600" />
            <span className="text-sm">Castes</span>
          </button>
          <button onClick={() => setShowQuotas(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faDatabase} className="text-gray-600" />
            <span className="text-sm">Quotas</span>
          </button>
          <button onClick={() => setShowReligions(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faBell} className="text-gray-600" />
            <span className="text-sm">Religions</span>
          </button>
          <button onClick={() => setShowSemesters(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faGraduationCap} className="text-gray-600" />
            <span className="text-sm">Semesters</span>
          </button>
          <button onClick={() => setShowBatches(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faLayerGroup} className="text-gray-600" />
            <span className="text-sm">Student Batches</span>
          </button>
          <button onClick={() => setShowIdentifiers(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faIdCard} className="text-gray-600" />
            <span className="text-sm">Student Identifiers</span>
          </button>
          <button onClick={() => setShowCustomFieldValues(true)} className="flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50">
            <FontAwesomeIcon icon={faList} className="text-gray-600" />
            <span className="text-sm">Custom Field Values</span>
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Student
        </button>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, roll no..."
              value={searchTerm}
              onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select value={statusFilter} onChange={(e)=>{ setPage(1); setStatusFilter(e.target.value); }} className="px-3 py-2 border rounded-lg">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select value={departmentFilter} onChange={(e)=>{ setPage(1); setDepartmentFilter(e.target.value); }} className="px-3 py-2 border rounded-lg">
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
          <div className="flex space-x-2">
            <select value={yearFilter} onChange={(e)=>{ setPage(1); setYearFilter(e.target.value); }} className="px-3 py-2 border rounded-lg">
              <option value="">Year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            <select value={sectionFilter} onChange={(e)=>{ setPage(1); setSectionFilter(e.target.value); }} className="px-3 py-2 border rounded-lg">
              <option value="">Sec</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center space-x-2">
              <button onClick={()=> setPage(p=> Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
              <span className="text-sm">Page {page}</span>
              <button onClick={()=> setPage(p=> p+1)} className="px-3 py-1 border rounded">Next</button>
            </div>
            <select value={pageSize} onChange={(e)=>{ setPage(1); setPageSize(Number(e.target.value)); }} className="px-2 py-1 border rounded">
              {[10,20,50,100].map(n => (<option key={n} value={n}>{n}/page</option>))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.roll_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              {['Basic', 'Academic', 'Contact', 'Address', 'Family', 'Emergency', 'Medical', 'Additional'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.toLowerCase()
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Basic Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Roll Number *</label>
                      <input
                        type="text"
                        value={formData.roll_number}
                        onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name *</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                      <input
                        type="text"
                        value={formData.middle_name}
                        onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                      <input
                        type="text"
                        value={formData.aadhar_number}
                        onChange={(e) => setFormData({...formData, aadhar_number: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        maxLength="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="GRADUATED">Graduated</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DROPPED">Dropped</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Information Tab */}
              {activeTab === 'academic' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Academic Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Department</option>
                        <option value="CSE">Computer Science & Engineering</option>
                        <option value="ECE">Electronics & Communication Engineering</option>
                        <option value="EEE">Electrical & Electronics Engineering</option>
                        <option value="ME">Mechanical Engineering</option>
                        <option value="CE">Civil Engineering</option>
                        <option value="IT">Information Technology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                      <input
                        type="text"
                        value={formData.academic_year}
                        onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                        placeholder="e.g., 2024-2025"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                      <select
                        value={formData.year_of_study}
                        onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num.toString()}>Semester {num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Section</label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quota</label>
                      <select
                        value={formData.quota}
                        onChange={(e) => setFormData({...formData, quota: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Quota</option>
                        <option value="GENERAL">General</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                        <option value="EWS">EWS</option>
                        <option value="PHYSICALLY_CHALLENGED">Physically Challenged</option>
                        <option value="SPORTS">Sports</option>
                        <option value="NRI">NRI</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rank</label>
                      <input
                        type="text"
                        value={formData.rank}
                        onChange={(e) => setFormData({...formData, rank: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Academic Program</label>
                      <input
                        type="text"
                        value={formData.academic_program}
                        onChange={(e) => setFormData({...formData, academic_program: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                      <input
                        type="date"
                        value={formData.enrollment_date}
                        onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Graduation Date</label>
                      <input
                        type="date"
                        value={formData.expected_graduation_date}
                        onChange={(e) => setFormData({...formData, expected_graduation_date: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student Mobile</label>
                      <input
                        type="tel"
                        value={formData.student_mobile}
                        onChange={(e) => setFormData({...formData, student_mobile: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information Tab */}
              {activeTab === 'address' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Address Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Village</label>
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => setFormData({...formData, village: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                      <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Family Information Tab */}
              {activeTab === 'family' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Family Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                      <input
                        type="text"
                        value={formData.father_name}
                        onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Father's Mobile</label>
                      <input
                        type="tel"
                        value={formData.father_mobile}
                        onChange={(e) => setFormData({...formData, father_mobile: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                      <input
                        type="text"
                        value={formData.mother_name}
                        onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mother's Mobile</label>
                      <input
                        type="tel"
                        value={formData.mother_mobile}
                        onChange={(e) => setFormData({...formData, mother_mobile: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
                      <input
                        type="text"
                        value={formData.guardian_name}
                        onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
                      <input
                        type="tel"
                        value={formData.guardian_phone}
                        onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guardian Email</label>
                      <input
                        type="email"
                        value={formData.guardian_email}
                        onChange={(e) => setFormData({...formData, guardian_email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guardian Relationship</label>
                      <input
                        type="text"
                        value={formData.guardian_relationship}
                        onChange={(e) => setFormData({...formData, guardian_relationship: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Religion</label>
                      <select
                        value={formData.religion}
                        onChange={(e) => setFormData({...formData, religion: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Religion</option>
                        <option value="HINDU">Hindu</option>
                        <option value="MUSLIM">Muslim</option>
                        <option value="CHRISTIAN">Christian</option>
                        <option value="SIKH">Sikh</option>
                        <option value="BUDDHIST">Buddhist</option>
                        <option value="JAIN">Jain</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Caste</label>
                      <input
                        type="text"
                        value={formData.caste}
                        onChange={(e) => setFormData({...formData, caste: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subcaste</label>
                      <input
                        type="text"
                        value={formData.subcaste}
                        onChange={(e) => setFormData({...formData, subcaste: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact Tab */}
              {activeTab === 'emergency' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact Relationship</label>
                      <input
                        type="text"
                        value={formData.emergency_contact_relationship}
                        onChange={(e) => setFormData({...formData, emergency_contact_relationship: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Information Tab */}
              {activeTab === 'medical' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Medical Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                      <textarea
                        value={formData.medical_conditions}
                        onChange={(e) => setFormData({...formData, medical_conditions: e.target.value})}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Any medical conditions or allergies..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                      <textarea
                        value={formData.medications}
                        onChange={(e) => setFormData({...formData, medications: e.target.value})}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Current medications..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information Tab */}
              {activeTab === 'additional' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Additional Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows="4"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Additional notes about the student..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                      <input
                        type="url"
                        value={formData.profile_picture}
                        onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="https://example.com/profile.jpg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Managers as modals within Students page */}
      {showCustomFields && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Custom Fields</h3>
              <button onClick={() => setShowCustomFields(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <CustomFieldsManager />
          </div>
        </div>
      )}

      {showDocumentsManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Student Documents</h3>
              <button onClick={() => setShowDocumentsManager(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <DocumentsManager students={students} />
          </div>
        </div>
      )}

      {showEnrollmentHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Enrollment Histories</h3>
              <button onClick={() => setShowEnrollmentHistory(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <EnrollmentHistoryManager />
          </div>
        </div>
      )}

      {showImportsManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Student Imports</h3>
              <button onClick={() => setShowImportsManager(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <ImportOperationsManager />
          </div>
        </div>
      )}

      {/* Lightweight modals linking to Django Admin for remaining entities */}
      {showAcademicYears && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Academic Years</h3>
              <button onClick={() => setShowAcademicYears(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage academic years in Django Admin.</p>
            <a href="/admin/students/academicyear/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showCastes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Castes</h3>
              <button onClick={() => setShowCastes(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage castes in Django Admin.</p>
            <a href="/admin/students/caste/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showQuotas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Quotas</h3>
              <button onClick={() => setShowQuotas(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage quotas in Django Admin.</p>
            <a href="/admin/students/quota/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showReligions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Religions</h3>
              <button onClick={() => setShowReligions(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage religions in Django Admin.</p>
            <a href="/admin/students/religion/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showSemesters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Semesters</h3>
              <button onClick={() => setShowSemesters(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage semesters in Django Admin.</p>
            <a href="/admin/students/semester/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showBatches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Student Batches</h3>
              <button onClick={() => setShowBatches(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage student batches in Django Admin.</p>
            <a href="/admin/students/studentbatch/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showIdentifiers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Student Identifiers</h3>
              <button onClick={() => setShowIdentifiers(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage student identifiers in Django Admin.</p>
            <a href="/admin/students/studentidentifier/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}

      {showCustomFieldValues && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Student Custom Field Values</h3>
              <button onClick={() => setShowCustomFieldValues(false)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-3">Manage student custom field values in Django Admin.</p>
            <a href="/admin/students/studentcustomfieldvalue/" target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-blue-600 text-white rounded">Open Admin</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCRUD;
