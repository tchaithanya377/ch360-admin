import React, { useMemo, useState } from "react";
import facultyApiService from '../../services/facultyApiService';

const todayStr = () => new Date().toISOString().slice(0,10);

const FacultyCreateForm = ({ onClose, onCreated, mode = 'create', facultyId = null, initialPersonal, initialAcademic, initialEmployment }) => {
  const defaultPersonal = {
    name: "",
    apaar_faculty_id: "",
    employee_id: "",
    pan_no: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    date_of_birth: "",
    gender: "",
    email: "",
    phone_number: "",
    alternate_phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    achievements: "",
    research_interests: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    bio: "",
    notes: "",
  };

  const defaultAcademic = {
    highest_degree: "Ph.D.",
    university: "",
    area_of_specialization: "",
    highest_qualification: "Ph.D.",
    specialization: "",
    year_of_completion: "",
  };

  const defaultEmployment = {
    date_of_joining_institution: todayStr(),
    designation_at_joining: "",
    present_designation: "",
    date_designated_as_professor: "",
    nature_of_association: "REGULAR",
    contractual_full_time_part_time: "",
    currently_associated: true,
    date_of_leaving: "",
    experience_in_current_institute: "0",
    designation: "LECTURER",
    department: "OTHER",
    employment_type: "FULL_TIME",
    status: "ACTIVE",
    date_of_joining: todayStr(),
    experience_years: "0",
    previous_institution: "",
  };

  const [personal, setPersonal] = useState({ ...defaultPersonal, ...(initialPersonal || {}) });
  const [academic, setAcademic] = useState({ ...defaultAcademic, ...(initialAcademic || {}) });
  const [employment, setEmployment] = useState({ ...defaultEmployment, ...(initialEmployment || {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const steps = ["Basic", "Academic", "Employment", "Contact", "Documents"];
  const [step, setStep] = useState(0);

  // Document types and dynamic documents list
  const [documentTypes, setDocumentTypes] = useState([
    'APPOINTMENT_LETTER',
    'ID_PROOF',
    'ADDRESS_PROOF',
    'QUALIFICATION_CERTIFICATE',
    'EXPERIENCE_CERTIFICATE',
    'PAN_CARD',
    'AADHAAR',
    'OTHER'
  ]);
  const makeEmptyDoc = () => ({
    faculty: "",
    document_type: '',
    title: '',
    file: null,
    description: '',
    is_verified: false,
    verified_by: '',
    verified_at_date: '',
    verified_at_time: ''
  });
  const [docs, setDocs] = useState([makeEmptyDoc()]);

  const getVerifiedAtIso = (d) => {
    const date = d.verified_at_date; const time = d.verified_at_time || '00:00';
    return date ? new Date(`${date}T${time}:00`).toISOString() : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(""); setSuccess(""); setFieldErrors({});
      const toDateOrNull = (v) => (v && /\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0,10) : null);
      const normalizePan = (v) => (v ? v.toString().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10) : '');
      const normalizePhone = (v) => {
        const digits = (v || '').toString().replace(/\D/g,'');
        if (!digits) return '';
        const clipped = digits.slice(0,15); // max 15 without plus -> will add plus below
        return `+${clipped}`.slice(0,16); // include '+' in count (up to 15 digits allowed)
      };

      const payload = { ...personal, ...academic, ...employment };
      // Field normalizations for backend validation
      payload.pan_no = normalizePan(payload.pan_no);
      payload.date_designated_as_professor = toDateOrNull(payload.date_designated_as_professor);
      payload.date_of_leaving = toDateOrNull(payload.date_of_leaving);
      payload.date_of_joining_institution = toDateOrNull(payload.date_of_joining_institution) || todayStr();
      payload.date_of_joining = toDateOrNull(payload.date_of_joining) || todayStr();
      payload.phone_number = normalizePhone(payload.phone_number);
      const phoneRe = /^\+\d{9,15}$/;
      if (!phoneRe.test(payload.phone_number)) {
        setError("Phone number must be in format +[countrycode][number], 9-15 digits.");
        setSaving(false);
        return;
      }

      // Client-side required validation to avoid 400s
      const required = {
        name: payload.name,
        apaar_faculty_id: payload.apaar_faculty_id,
        employee_id: payload.employee_id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        date_of_birth: payload.date_of_birth,
        gender: payload.gender,
        highest_degree: payload.highest_degree,
        highest_qualification: payload.highest_qualification,
        date_of_joining_institution: payload.date_of_joining_institution,
        date_of_joining: payload.date_of_joining,
        designation_at_joining: payload.designation_at_joining || payload.designation,
        present_designation: payload.present_designation || payload.designation,
        designation: payload.designation,
        employment_type: payload.employment_type,
        status: payload.status,
        currently_associated: typeof payload.currently_associated === 'boolean' ? payload.currently_associated : true,
        nature_of_association: payload.nature_of_association,
        experience_in_current_institute: payload.experience_in_current_institute,
        experience_years: payload.experience_years,
        department: payload.department,
        email: payload.email,
        phone_number: payload.phone_number,
        address_line_1: payload.address_line_1,
        city: payload.city,
        state: payload.state,
        postal_code: payload.postal_code,
        emergency_contact_name: payload.emergency_contact_name,
        emergency_contact_phone: payload.emergency_contact_phone,
        emergency_contact_relationship: payload.emergency_contact_relationship,
        is_head_of_department: payload.is_head_of_department ?? false,
        is_mentor: payload.is_mentor ?? false,
      };
      const missing = Object.entries(required).filter(([k,v]) => v === undefined || v === null || v === "");
      if (missing.length) {
        setError(`Please fill required fields: ${missing.map(([k]) => k).join(', ')}`);
        setSaving(false);
        return;
      }
      let created = null;
      if (mode === 'edit' && facultyId) {
        created = await facultyApiService.updateFaculty(facultyId, payload);
        setSuccess('Faculty updated');
      } else {
        created = await facultyApiService.createFaculty(payload);
        setSuccess('Faculty created');
      }
      onCreated && onCreated(created);
      // Upload all provided documents
      if (created?.id) {
        for (const d of docs) {
          if (!d?.file) continue;
          try {
            const formData = new FormData();
            formData.append('faculty', created.id);
            if (d.document_type) formData.append('document_type', d.document_type);
            if (d.title) formData.append('title', d.title);
            formData.append('file', d.file);
            if (d.description) formData.append('description', d.description);
            formData.append('is_verified', d.is_verified ? 'true' : 'false');
            if (d.verified_by) formData.append('verified_by', d.verified_by);
            const iso = getVerifiedAtIso(d);
            if (iso) formData.append('verified_at', iso);

            const url = `${facultyApiService.baseURL}/documents/`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Authorization': facultyApiService.getHeaders().Authorization },
              body: formData
            });
            if (!res.ok) console.warn('Document upload failed');
          } catch (docErr) {
            console.warn('Document upload error', docErr);
          }
        }
      }
      onClose && onClose();
    } catch (err) {
      // Map backend field errors to inputs
      if (err?.data && typeof err.data === 'object') {
        setFieldErrors(err.data);
        const firstKey = Object.keys(err.data)[0];
        const firstMsg = Array.isArray(err.data[firstKey]) ? err.data[firstKey][0] : String(err.data[firstKey]);
        setError(firstMsg || (err.message || 'Submission failed'));
      } else {
        setError(err?.message || 'Submission failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const noteTime = (
    <p className="text-xs text-gray-500">Note: You are 5.5 hours ahead of server time.</p>
  );

  const renderErr = (key) => {
    const val = fieldErrors?.[key];
    if (!val) return null;
    const msg = Array.isArray(val) ? val.join(' ') : String(val);
    return <p className="text-xs text-red-600 mt-1">{msg}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={() => onClose && onClose()}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit faculty' : 'Add faculty'}</h3>
            <p className="text-gray-600 mt-1">{mode === 'edit' ? 'Update faculty profile' : 'Create a new faculty profile'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">×</button>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                className={`flex-1 text-sm py-2 border-b-2 ${step===i? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} transition-colors`}
              >{i+1}. {label}</button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {error && <div className="px-4 py-2 rounded bg-red-100 text-red-700">{error}</div>}

          {step === 0 && (
          <section>
            <h4 className="text-lg font-semibold mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name<span className="text-red-500"> *</span></label>
                <input className="w-full border rounded px-3 py-2" value={personal.name} onChange={e=>setPersonal({...personal, name:e.target.value})} placeholder="Name of the Faculty" />
                {renderErr('name')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apaar faculty id</label>
                <input className="w-full border rounded px-3 py-2" value={personal.apaar_faculty_id} onChange={e=>setPersonal({...personal, apaar_faculty_id:e.target.value})} placeholder="APAAR Faculty ID" />
                {renderErr('apaar_faculty_id')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employee id</label>
                <input className="w-full border rounded px-3 py-2" value={personal.employee_id} onChange={e=>setPersonal({...personal, employee_id:e.target.value})} placeholder="Unique employee identifier" />
                {renderErr('employee_id')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pan no</label>
                <input className="w-full border rounded px-3 py-2" value={personal.pan_no} onChange={e=>setPersonal({...personal, pan_no:e.target.value})} placeholder="PAN Number" />
                {renderErr('pan_no')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First name</label>
                <input className="w-full border rounded px-3 py-2" value={personal.first_name} onChange={e=>setPersonal({...personal, first_name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name</label>
                <input className="w-full border rounded px-3 py-2" value={personal.last_name} onChange={e=>setPersonal({...personal, last_name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Middle name</label>
                <input className="w-full border rounded px-3 py-2" value={personal.middle_name} onChange={e=>setPersonal({...personal, middle_name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of birth</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={personal.date_of_birth} onChange={e=>setPersonal({...personal, date_of_birth:e.target.value})} />
                {renderErr('date_of_birth')}
                {noteTime}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select className="w-full border rounded px-3 py-2" value={personal.gender} onChange={e=>setPersonal({...personal, gender:e.target.value})}>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                {renderErr('gender')}
              </div>
            </div>
          </section>
          )}

          {step === 1 && (
          <section>
            <h4 className="text-lg font-semibold mb-3">Academic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Highest degree</label>
                <input className="w-full border rounded px-3 py-2" value={academic.highest_degree} onChange={e=>setAcademic({...academic, highest_degree:e.target.value})} placeholder="Highest Degree" />
                {renderErr('highest_degree')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">University</label>
                <input className="w-full border rounded px-3 py-2" value={academic.university} onChange={e=>setAcademic({...academic, university:e.target.value})} placeholder="University" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Area of specialization</label>
                <input className="w-full border rounded px-3 py-2" value={academic.area_of_specialization} onChange={e=>setAcademic({...academic, area_of_specialization:e.target.value})} placeholder="Area of Specialization" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Highest qualification</label>
                <input className="w-full border rounded px-3 py-2" value={academic.highest_qualification} onChange={e=>setAcademic({...academic, highest_qualification:e.target.value})} placeholder="Highest qualification" />
                {renderErr('highest_qualification')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <input className="w-full border rounded px-3 py-2" value={academic.specialization} onChange={e=>setAcademic({...academic, specialization:e.target.value})} placeholder="Specialization" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year of completion</label>
                <input className="w-full border rounded px-3 py-2" value={academic.year_of_completion} onChange={e=>setAcademic({...academic, year_of_completion:e.target.value})} placeholder="YYYY" />
              </div>
            </div>
          </section>
          )}

          {step === 2 && (
          <section>
            <h4 className="text-lg font-semibold mb-3">Employment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date of joining institution</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={employment.date_of_joining_institution} onChange={e=>setEmployment({...employment, date_of_joining_institution:e.target.value})} />
                {renderErr('date_of_joining_institution')}
                {noteTime}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation at joining</label>
                <input className="w-full border rounded px-3 py-2" value={employment.designation_at_joining} onChange={e=>setEmployment({...employment, designation_at_joining:e.target.value})} placeholder="Designation at Time of Joining in this Institution" />
                {renderErr('designation_at_joining')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Present designation</label>
                <input className="w-full border rounded px-3 py-2" value={employment.present_designation} onChange={e=>setEmployment({...employment, present_designation:e.target.value})} placeholder="Present Designation" />
                {renderErr('present_designation')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date designated as professor</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={employment.date_designated_as_professor} onChange={e=>setEmployment({...employment, date_designated_as_professor:e.target.value})} />
                {renderErr('date_designated_as_professor')}
                {noteTime}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nature of association</label>
                <select className="w-full border rounded px-3 py-2" value={employment.nature_of_association} onChange={e=>setEmployment({...employment, nature_of_association:e.target.value})}>
                  <option value="REGULAR">Regular</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="AD_HOC">Ad hoc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contractual full time part time</label>
                <select className="w-full border rounded px-3 py-2" value={employment.contractual_full_time_part_time} onChange={e=>setEmployment({...employment, contractual_full_time_part_time:e.target.value})}>
                  <option value="">---------</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                </select>
                <p className="text-xs text-gray-500">If contractual mention Full time or Part time</p>
              </div>
              <div className="flex items-center space-x-2">
                <input id="currently" type="checkbox" checked={!!employment.currently_associated} onChange={e=>setEmployment({...employment, currently_associated:e.target.checked})} />
                <label htmlFor="currently" className="text-sm">Currently associated</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of leaving</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={employment.date_of_leaving} onChange={e=>setEmployment({...employment, date_of_leaving:e.target.value})} />
                {noteTime}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience in current institute</label>
                <input className="w-full border rounded px-3 py-2" value={employment.experience_in_current_institute} onChange={e=>setEmployment({...employment, experience_in_current_institute:e.target.value})} placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <select className="w-full border rounded px-3 py-2" value={employment.designation} onChange={e=>setEmployment({...employment, designation:e.target.value})}>
                  <option value="LECTURER">Lecturer</option>
                  <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
                  <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="HEAD_OF_DEPARTMENT">Head of Department</option>
                  <option value="DEAN">Dean</option>
                  <option value="PRINCIPAL">Principal</option>
                  <option value="VICE_PRINCIPAL">Vice Principal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select className="w-full border rounded px-3 py-2" value={employment.department} onChange={e=>setEmployment({...employment, department:e.target.value})}>
                  <option value="OTHER">Other</option>
                  <option value="COMPUTER_SCIENCE">Computer Science</option>
                  <option value="MATHEMATICS">Mathematics</option>
                  <option value="PHYSICS">Physics</option>
                  <option value="CHEMISTRY">Chemistry</option>
                  <option value="BIOLOGY">Biology</option>
                  <option value="ENGLISH">English</option>
                  <option value="HISTORY">History</option>
                  <option value="GEOGRAPHY">Geography</option>
                  <option value="ECONOMICS">Economics</option>
                  <option value="COMMERCE">Commerce</option>
                  <option value="PHYSICAL_EDUCATION">Physical Education</option>
                  <option value="ARTS">Arts</option>
                  <option value="MUSIC">Music</option>
                  <option value="ADMINISTRATION">Administration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employment type</label>
                <select className="w-full border rounded px-3 py-2" value={employment.employment_type} onChange={e=>setEmployment({...employment, employment_type:e.target.value})}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="VISITING">Visiting</option>
                  <option value="ADJUNCT">Adjunct</option>
                </select>
                {renderErr('employment_type')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full border rounded px-3 py-2" value={employment.status} onChange={e=>setEmployment({...employment, status:e.target.value})}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="RETIRED">Retired</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
                {renderErr('status')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of joining</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={employment.date_of_joining} onChange={e=>setEmployment({...employment, date_of_joining:e.target.value})} />
                {renderErr('date_of_joining')}
                {noteTime}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience years</label>
                <input className="w-full border rounded px-3 py-2" value={employment.experience_years} onChange={e=>setEmployment({...employment, experience_years:e.target.value})} placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Previous institution</label>
                <input className="w-full border rounded px-3 py-2" value={employment.previous_institution} onChange={e=>setEmployment({...employment, previous_institution:e.target.value})} />
              </div>
            </div>
          </section>
          )}

          {step === 3 && (
          <>
          <section>
            <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2" value={personal.email} onChange={e=>setPersonal({...personal, email:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone number</label>
                <input className="w-full border rounded px-3 py-2" value={personal.phone_number} onChange={e=>setPersonal({...personal, phone_number:e.target.value})} placeholder="+919876543210" />
                {renderErr('phone_number')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alternate phone</label>
                <input className="w-full border rounded px-3 py-2" value={personal.alternate_phone} onChange={e=>setPersonal({...personal, alternate_phone:e.target.value})} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address line 1</label>
                  <input className="w-full border rounded px-3 py-2" value={personal.address_line_1} onChange={e=>setPersonal({...personal, address_line_1:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address line 2</label>
                  <input className="w-full border rounded px-3 py-2" value={personal.address_line_2} onChange={e=>setPersonal({...personal, address_line_2:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input className="w-full border rounded px-3 py-2" value={personal.city} onChange={e=>setPersonal({...personal, city:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input className="w-full border rounded px-3 py-2" value={personal.state} onChange={e=>setPersonal({...personal, state:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal code</label>
                  <input className="w-full border rounded px-3 py-2" value={personal.postal_code} onChange={e=>setPersonal({...personal, postal_code:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input className="w-full border rounded px-3 py-2" value={personal.country} onChange={e=>setPersonal({...personal, country:e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold mb-3">Professional & Emergency</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Achievements</label>
                <textarea className="w-full border rounded px-3 py-2" value={personal.achievements} onChange={e=>setPersonal({...personal, achievements:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Research interests</label>
                <textarea className="w-full border rounded px-3 py-2" value={personal.research_interests} onChange={e=>setPersonal({...personal, research_interests:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency contact name</label>
                <input className="w-full border rounded px-3 py-2" value={personal.emergency_contact_name} onChange={e=>setPersonal({...personal, emergency_contact_name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency contact phone</label>
                <input className="w-full border rounded px-3 py-2" value={personal.emergency_contact_phone} onChange={e=>setPersonal({...personal, emergency_contact_phone:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency contact relationship</label>
                <input className="w-full border rounded px-3 py-2" value={personal.emergency_contact_relationship} onChange={e=>setPersonal({...personal, emergency_contact_relationship:e.target.value})} />
              </div>
            </div>
          </section>
          </>
          )}

          {step === 4 && (
          <section>
            <h4 className="text-lg font-semibold mb-3">Add faculty document</h4>
            {docs.map((d, idx) => (
              <div key={idx} className="mb-4 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Document type</label>
                    <div className="flex space-x-2">
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={d.document_type}
                        onChange={e=>{
                          const val = e.target.value;
                          const copy = [...docs];
                          copy[idx] = { ...copy[idx], document_type: val };
                          setDocs(copy);
                        }}
                      >
                        <option value="">---------</option>
                        {documentTypes.map((t) => (
                          <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                        ))}
                        <option value="__ADD_NEW__">+ Add new…</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const name = prompt('Add new document type (use letters, numbers, underscores)');
                          if (!name) return;
                          const code = name.trim().toUpperCase().replace(/\s+/g,'_');
                          if (!documentTypes.includes(code)) setDocumentTypes([...documentTypes, code]);
                          const copy = [...docs];
                          copy[idx] = { ...copy[idx], document_type: code };
                          setDocs(copy);
                        }}
                        className="px-3 py-2 border rounded"
                      >Add</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input className="w-full border rounded px-3 py-2" value={d.title} onChange={e=>{ const copy=[...docs]; copy[idx]={...copy[idx], title:e.target.value}; setDocs(copy); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File</label>
                    <input type="file" onChange={e=>{ const f=e.target.files?.[0]||null; const copy=[...docs]; copy[idx]={...copy[idx], file:f}; setDocs(copy); }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded px-3 py-2" value={d.description} onChange={e=>{ const copy=[...docs]; copy[idx]={...copy[idx], description:e.target.value}; setDocs(copy); }} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id={`is_verified_${idx}`} type="checkbox" checked={!!d.is_verified} onChange={e=>{ const copy=[...docs]; copy[idx]={...copy[idx], is_verified:e.target.checked}; setDocs(copy); }} />
                    <label htmlFor={`is_verified_${idx}`} className="text-sm">Is verified</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Verified by</label>
                    <input className="w-full border rounded px-3 py-2" value={d.verified_by} onChange={e=>{ const copy=[...docs]; copy[idx]={...copy[idx], verified_by:e.target.value}; setDocs(copy); }} placeholder="---------" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Verified at - Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={d.verified_at_date} onChange={e=>{ const copy=[...docs]; copy[idx]={...copy[idx], verified_at_date:e.target.value}; setDocs(copy); }} />
                      {noteTime}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Verified at - Time</label>
                      <input type="time" className="w-full border rounded px-3 py-2" value={d.verified_at_time} onChange={e=>{ const copy=[...docs]; copy[idx]={...copy[idx], verified_at_time:e.target.value}; setDocs(copy); }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between">
                  <button type="button" className="px-3 py-2 text-sm border rounded" onClick={() => setDocs(prev => [...prev, makeEmptyDoc()])}>+ Add more</button>
                  {docs.length > 1 && (
                    <button type="button" className="px-3 py-2 text-sm border rounded text-red-600" onClick={() => setDocs(prev => prev.filter((_,i)=>i!==idx))}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </section>
          )}

          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-gray-500">Step {step+1} of {steps.length}</div>
            <div className="space-x-2">
              <button type="button" onClick={onClose} className="px-5 py-2 border rounded">Close</button>
              <button type="button" onClick={() => setStep(s => Math.max(0, s-1))} className="px-5 py-2 border rounded" disabled={step===0}>Back</button>
              {step < steps.length - 1 ? (
                <button type="button" onClick={() => setStep(s => Math.min(steps.length-1, s+1))} className="px-5 py-2 bg-blue-600 text-white rounded">Next</button>
              ) : (
                <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyCreateForm;


