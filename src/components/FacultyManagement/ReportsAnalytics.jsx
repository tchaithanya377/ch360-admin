import React, { useState, useEffect } from "react";
import facultyApiService from '../../services/facultyApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faChalkboardTeacher,
  faChartLine,
  faDownload,
  faSearch,
  faFilter,
  faPrint,
  faEye,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faUserCheck,
  faUserEdit,
  faUserMinus,
  faUserPlus,
  faUserTimes,
  faUserClock,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState("faculty-directory");
  const [facultyDirectory, setFacultyDirectory] = useState([]);
  const [teachingReports, setTeachingReports] = useState([]);
  const [performanceReports, setPerformanceReports] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");

  useEffect(() => {
    // Mock data for development - TODO: Replace with actual API calls
    const mockFacultyDirectory = [
      {
        id: 1,
        name: "Dr. John Smith",
        designation: "Professor",
        department: "Computer Science",
        email: "john.smith@university.edu",
        phone: "1234567890",
        specialization: "Machine Learning"
      }
    ];

    const mockTeachingReports = [
      {
        id: 1,
        facultyName: "Dr. John Smith",
        course: "Data Structures",
        semester: "Fall 2024",
        studentsEnrolled: 45,
        averageRating: 4.5
      }
    ];

    const mockPerformanceReports = [
      {
        id: 1,
        facultyName: "Dr. John Smith",
        academicYear: "2023-24",
        teachingScore: 85,
        researchScore: 90,
        serviceScore: 75,
        overallScore: 83.3
      }
    ];

    const mockComplianceReports = [
      {
        id: 1,
        reportType: "NAAC Compliance",
        period: "2024 Q1",
        status: "Compliant",
        lastUpdated: "2024-01-15",
        complianceScore: 95
      }
    ];

    setFacultyDirectory(mockFacultyDirectory);
    setTeachingReports(mockTeachingReports);
    setPerformanceReports(mockPerformanceReports);
    setComplianceReports(mockComplianceReports);
  }, []);

  const tabs = [
    { id: "faculty-directory", name: "Faculty Directory", icon: faUsers, count: facultyDirectory.length },
    { id: "teaching-reports", name: "Teaching Reports", icon: faChalkboardTeacher, count: teachingReports.length },
    { id: "performance-reports", name: "Performance Reports", icon: faChartLine, count: performanceReports.length },
    { id: "compliance-reports", name: "Compliance Reports", icon: faChartBar, count: complianceReports.length }
  ];

  const filteredFaculty = facultyDirectory.filter((faculty) => {
    const matchesSearch = faculty.personalDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.employmentDetails?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || faculty.employmentDetails?.department === filterDepartment;
    const matchesDesignation = !filterDesignation || faculty.employmentDetails?.designation === filterDesignation;
    
    return matchesSearch && matchesDepartment && matchesDesignation;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "faculty-directory":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Faculty Directory</h3>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  <FontAwesomeIcon icon={faPrint} className="mr-2" />
                  Print
                </button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterDesignation}
                    onChange={(e) => setFilterDesignation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Designations</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
                <div>
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFaculty.map((faculty) => (
                    <tr key={faculty.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FontAwesomeIcon icon={faUserTie} className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {faculty.personalDetails?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {faculty.personalDetails?.employeeId || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faculty.employmentDetails?.department || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faculty.employmentDetails?.designation || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{faculty.personalDetails?.email || "N/A"}</div>
                          <div className="text-gray-500">{faculty.personalDetails?.phone || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          faculty.employmentDetails?.status === "Active" ? "bg-green-100 text-green-800" :
                          faculty.employmentDetails?.status === "On Leave" ? "bg-yellow-100 text-yellow-800" :
                          faculty.employmentDetails?.status === "Probation" ? "bg-orange-100 text-orange-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {faculty.employmentDetails?.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <FontAwesomeIcon icon={faPrint} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "teaching-reports":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Teaching Load Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachingReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{report.reportName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.type === "Department-wise" ? "bg-blue-100 text-blue-800" :
                      report.type === "Faculty-wise" ? "bg-green-100 text-green-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {report.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Period:</strong> {report.period}</p>
                    <p><strong>Total Faculty:</strong> {report.totalFaculty}</p>
                    <p><strong>Average Workload:</strong> {report.averageWorkload} hrs/week</p>
                    <p><strong>Generated:</strong> {report.generatedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faPrint} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "performance-reports":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Performance Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{report.reportName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.category === "Excellent" ? "bg-green-100 text-green-800" :
                      report.category === "Good" ? "bg-blue-100 text-blue-800" :
                      report.category === "Average" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {report.category}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Faculty:</strong> {report.facultyName}</p>
                    <p><strong>Department:</strong> {report.department}</p>
                    <p><strong>Score:</strong> {report.score}/100</p>
                    <p><strong>Period:</strong> {report.period}</p>
                    <p><strong>Generated:</strong> {report.generatedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          report.score >= 80 ? "bg-green-600" :
                          report.score >= 60 ? "bg-blue-600" :
                          report.score >= 40 ? "bg-yellow-600" : "bg-red-600"
                        }`}
                        style={{ width: `${report.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faChartLine} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "compliance-reports":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compliance Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{report.reportName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.complianceStatus === "Compliant" ? "bg-green-100 text-green-800" :
                      report.complianceStatus === "Non-Compliant" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {report.complianceStatus}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Standard:</strong> {report.standard}</p>
                    <p><strong>Department:</strong> {report.department}</p>
                    <p><strong>Compliance Rate:</strong> {report.complianceRate}%</p>
                    <p><strong>Last Audit:</strong> {report.lastAudit}</p>
                    <p><strong>Generated:</strong> {report.generatedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          report.complianceRate >= 90 ? "bg-green-600" :
                          report.complianceRate >= 70 ? "bg-yellow-600" : "bg-red-600"
                        }`}
                        style={{ width: `${report.complianceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faChartBar} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and analytics for faculty management</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
