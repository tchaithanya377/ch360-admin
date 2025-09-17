import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
const StudentAnalytics = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [analytics, setAnalytics] = useState({});
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [demographics, setDemographics] = useState({});

  // Fetch students data
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentsCollection = collection(db, "students");
      const querySnapshot = await getDocs(studentsCollection);
      const allStudents = [];
      
      for (const yearDoc of querySnapshot.docs) {
        const sectionsSnapshot = await getDocs(collection(db, `students/${yearDoc.id}`));
        
        for (const sectionDoc of sectionsSnapshot.docs) {
          const studentsSnapshot = await getDocs(collection(db, `students/${yearDoc.id}/${sectionDoc.id}`));
          
          studentsSnapshot.docs.forEach(studentDoc => {
            allStudents.push({
              id: studentDoc.id,
              ...studentDoc.data(),
              year: yearDoc.id,
              section: sectionDoc.id
            });
          });
        }
      }
      
      setStudents(allStudents);
      calculateAnalytics(allStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive analytics
  const calculateAnalytics = (studentList) => {
    const analytics = {
      total: studentList.length,
      byYear: {},
      bySection: {},
      byBranch: {},
      byGender: {},
      byCategory: {},
      byStatus: {},
      byReligion: {},
      byNationality: {},
      byState: {},
      byDistrict: {},
      byBloodGroup: {},
      byQuota: {},
      byHostel: {},
      byTransport: {},
      recentAdmissions: 0,
      averageAge: 0,
      ageDistribution: {},
      enrollmentByMonth: {},
      topBranches: [],
      genderRatio: {},
      categoryDistribution: {},
      statusDistribution: {},
      regionalDistribution: {},
      academicPerformance: {
        averagePercentage: 0,
        performanceDistribution: {}
      }
    };

    let totalAge = 0;
    let ageCount = 0;

    studentList.forEach(student => {
      // Basic counts
      analytics.byYear[student.year] = (analytics.byYear[student.year] || 0) + 1;
      analytics.bySection[student.section] = (analytics.bySection[student.section] || 0) + 1;
      
      if (student.branch) {
        analytics.byBranch[student.branch] = (analytics.byBranch[student.branch] || 0) + 1;
      }
      
      if (student.gender) {
        analytics.byGender[student.gender] = (analytics.byGender[student.gender] || 0) + 1;
      }
      
      if (student.category) {
        analytics.byCategory[student.category] = (analytics.byCategory[student.category] || 0) + 1;
      }
      
      if (student.religion) {
        analytics.byReligion[student.religion] = (analytics.byReligion[student.religion] || 0) + 1;
      }
      
      if (student.nationality) {
        analytics.byNationality[student.nationality] = (analytics.byNationality[student.nationality] || 0) + 1;
      }
      
      if (student.stateOfOrigin) {
        analytics.byState[student.stateOfOrigin] = (analytics.byState[student.stateOfOrigin] || 0) + 1;
      }
      
      if (student.district) {
        analytics.byDistrict[student.district] = (analytics.byDistrict[student.district] || 0) + 1;
      }
      
      if (student.bloodGroup) {
        analytics.byBloodGroup[student.bloodGroup] = (analytics.byBloodGroup[student.bloodGroup] || 0) + 1;
      }
      
      if (student.quota) {
        analytics.byQuota[student.quota] = (analytics.byQuota[student.quota] || 0) + 1;
      }
      
      if (student.hostelRequired) {
        analytics.byHostel[student.hostelRequired] = (analytics.byHostel[student.hostelRequired] || 0) + 1;
      }
      
      if (student.transportRequired) {
        analytics.byTransport[student.transportRequired] = (analytics.byTransport[student.transportRequired] || 0) + 1;
      }
      
      analytics.byStatus[student.status || "Active"] = (analytics.byStatus[student.status || "Active"] || 0) + 1;
      
      // Age calculation
      if (student.dateOfBirth) {
        const birthDate = new Date(student.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        totalAge += age;
        ageCount++;
        
        const ageGroup = age < 18 ? "Under 18" : 
                        age < 20 ? "18-19" : 
                        age < 22 ? "20-21" : 
                        age < 25 ? "22-24" : "25+";
        analytics.ageDistribution[ageGroup] = (analytics.ageDistribution[ageGroup] || 0) + 1;
      }
      
      // Recent admissions
      if (student.createdAt && student.createdAt.toDate) {
        const admissionDate = student.createdAt.toDate();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (admissionDate > thirtyDaysAgo) {
          analytics.recentAdmissions++;
        }
        
        // Enrollment by month
        const month = admissionDate.toLocaleString('default', { month: 'long' });
        analytics.enrollmentByMonth[month] = (analytics.enrollmentByMonth[month] || 0) + 1;
      }
      
      // Academic performance
      if (student.previousPercentage) {
        const percentage = parseFloat(student.previousPercentage);
        if (!isNaN(percentage)) {
          const performanceGroup = percentage >= 90 ? "90%+" :
                                  percentage >= 80 ? "80-89%" :
                                  percentage >= 70 ? "70-79%" :
                                  percentage >= 60 ? "60-69%" : "Below 60%";
          analytics.academicPerformance.performanceDistribution[performanceGroup] = 
            (analytics.academicPerformance.performanceDistribution[performanceGroup] || 0) + 1;
        }
      }
    });

    // Calculate averages and ratios
    if (ageCount > 0) {
      analytics.averageAge = Math.round(totalAge / ageCount);
    }

    // Top branches
    analytics.topBranches = Object.entries(analytics.byBranch)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([branch, count]) => ({ branch, count }));

    // Gender ratio
    const maleCount = analytics.byGender.Male || 0;
    const femaleCount = analytics.byGender.Female || 0;
    const totalGender = maleCount + femaleCount;
    if (totalGender > 0) {
      analytics.genderRatio = {
        male: Math.round((maleCount / totalGender) * 100),
        female: Math.round((femaleCount / totalGender) * 100)
      };
    }

    setAnalytics(analytics);
    calculateEnrollmentTrends(studentList);
    calculateDemographics(studentList);
  };

  // Calculate enrollment trends
  const calculateEnrollmentTrends = (studentList) => {
    const trends = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 3; year <= currentYear; year++) {
      const yearStudents = studentList.filter(s => s.year && s.year.includes(year.toString()));
      trends.push({
        year: year.toString(),
        count: yearStudents.length,
        branches: Object.entries(
          yearStudents.reduce((acc, student) => {
            if (student.branch) {
              acc[student.branch] = (acc[student.branch] || 0) + 1;
            }
            return acc;
          }, {})
        ).sort(([,a], [,b]) => b - a).slice(0, 3)
      });
    }
    
    setEnrollmentTrends(trends);
  };

  // Calculate demographics
  const calculateDemographics = (studentList) => {
    const demo = {
      genderDistribution: {},
      ageDistribution: {},
      regionalDistribution: {},
      categoryDistribution: {},
      religionDistribution: {},
      bloodGroupDistribution: {}
    };

    studentList.forEach(student => {
      // Gender distribution
      if (student.gender) {
        demo.genderDistribution[student.gender] = (demo.genderDistribution[student.gender] || 0) + 1;
      }

      // Age distribution
      if (student.dateOfBirth) {
        const birthDate = new Date(student.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        const ageGroup = age < 18 ? "Under 18" : 
                        age < 20 ? "18-19" : 
                        age < 22 ? "20-21" : 
                        age < 25 ? "22-24" : "25+";
        demo.ageDistribution[ageGroup] = (demo.ageDistribution[ageGroup] || 0) + 1;
      }

      // Regional distribution
      if (student.stateOfOrigin) {
        demo.regionalDistribution[student.stateOfOrigin] = (demo.regionalDistribution[student.stateOfOrigin] || 0) + 1;
      }

      // Category distribution
      if (student.category) {
        demo.categoryDistribution[student.category] = (demo.categoryDistribution[student.category] || 0) + 1;
      }

      // Religion distribution
      if (student.religion) {
        demo.religionDistribution[student.religion] = (demo.religionDistribution[student.religion] || 0) + 1;
      }

      // Blood group distribution
      if (student.bloodGroup) {
        demo.bloodGroupDistribution[student.bloodGroup] = (demo.bloodGroupDistribution[student.bloodGroup] || 0) + 1;
      }
    });

    setDemographics(demo);
  };

  // Load data on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on selection
  const filteredStudents = students.filter(student => {
    if (selectedYear !== "all" && student.year !== selectedYear) return false;
    if (selectedBranch !== "all" && student.branch !== selectedBranch) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and reports for university administration</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Years</option>
                {Object.keys(analytics.byYear).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Branches</option>
                {Object.keys(analytics.byBranch).map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredStudents.filter(s => s.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Age</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.averageAge || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Branches</p>
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(analytics.byBranch).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
            <div className="space-y-4">
              {Object.entries(demographics.genderDistribution).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{gender}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / filteredStudents.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
            <div className="space-y-4">
              {Object.entries(demographics.ageDistribution).map(([ageGroup, count]) => (
                <div key={ageGroup} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{ageGroup}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / filteredStudents.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Branches</h3>
            <div className="space-y-4">
              {analytics.topBranches.map(({ branch, count }) => (
                <div key={branch} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{branch}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / filteredStudents.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
            <div className="space-y-4">
              {Object.entries(demographics.categoryDistribution).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(count / filteredStudents.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrollment Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trends</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Branches</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollmentTrends.map((trend) => (
                  <tr key={trend.year}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {trend.branches.map(({ branch, count }) => (
                        <span key={branch} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {branch} ({count})
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(demographics.regionalDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 9)
              .map(([state, count]) => (
                <div key={state} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{state}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${(count / filteredStudents.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Group Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Group Distribution</h3>
            <div className="space-y-2">
              {Object.entries(demographics.bloodGroupDistribution).map(([bloodGroup, count]) => (
                <div key={bloodGroup} className="flex justify-between">
                  <span className="text-sm text-gray-700">{bloodGroup}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Religion Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Religion Distribution</h3>
            <div className="space-y-2">
              {Object.entries(demographics.religionDistribution).map(([religion, count]) => (
                <div key={religion} className="flex justify-between">
                  <span className="text-sm text-gray-700">{religion}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hostel & Transport Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Preferences</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hostel Required</h4>
                <div className="space-y-1">
                  {Object.entries(analytics.byHostel).map(([preference, count]) => (
                    <div key={preference} className="flex justify-between">
                      <span className="text-sm text-gray-600">{preference}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Transport Required</h4>
                <div className="space-y-1">
                  {Object.entries(analytics.byTransport).map(([preference, count]) => (
                    <div key={preference} className="flex justify-between">
                      <span className="text-sm text-gray-600">{preference}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
