import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faChartLine,
  faGraduationCap,
  faSpinner,
  faDownload,
  faEye,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
  faCalendarAlt,
  faUserGraduate,
  faBookOpen,
  faAward
} from '@fortawesome/free-solid-svg-icons';
import GradesApiService from '../../services/gradesApiService';

const GPADisplay = ({ studentId, gradesService }) => {
  const [sgpas, setSGPAs] = useState([]);
  const [cgpa, setCGPA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSGPA, setSelectedSGPA] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadGPAData();
    }
  }, [studentId]);

  const loadGPAData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sgpaData, cgpaData] = await Promise.all([
        gradesService.getSGPAs({ student: studentId }),
        gradesService.getCGPAs({ student: studentId })
      ]);
      
      setSGPAs(sgpaData.results || sgpaData);
      setCGPA(cgpaData.results?.[0] || cgpaData[0] || null);
      
    } catch (error) {
      console.error('Error loading GPA data:', error);
      setError('Failed to load GPA data');
    } finally {
      setLoading(false);
    }
  };

  const getAcademicStandingColor = (standing) => {
    const colors = {
      'EXCELLENT': 'text-green-600 bg-green-100',
      'VERY_GOOD': 'text-blue-600 bg-blue-100',
      'GOOD': 'text-yellow-600 bg-yellow-100',
      'SATISFACTORY': 'text-orange-600 bg-orange-100',
      'PASS': 'text-purple-600 bg-purple-100',
      'PROBATION': 'text-red-600 bg-red-100'
    };
    return colors[standing] || 'text-gray-600 bg-gray-100';
  };

  const getClassificationColor = (classification) => {
    const colors = {
      'FIRST_CLASS_DISTINCTION': 'text-green-600 bg-green-100',
      'FIRST_CLASS': 'text-blue-600 bg-blue-100',
      'SECOND_CLASS': 'text-yellow-600 bg-yellow-100',
      'PASS_CLASS': 'text-orange-600 bg-orange-100',
      'FAIL': 'text-red-600 bg-red-100'
    };
    return colors[classification] || 'text-gray-600 bg-gray-100';
  };

  const getCGPAStatus = (cgpaValue) => {
    if (cgpaValue >= 8.0) return { status: 'Excellent', color: 'text-green-600' };
    if (cgpaValue >= 7.0) return { status: 'Very Good', color: 'text-blue-600' };
    if (cgpaValue >= 6.0) return { status: 'Good', color: 'text-yellow-600' };
    if (cgpaValue >= 5.0) return { status: 'Satisfactory', color: 'text-orange-600' };
    return { status: 'Needs Improvement', color: 'text-red-600' };
  };

  const handleViewTranscript = async (cgpaId) => {
    try {
      setShowTranscript(true);
      // Transcript logic would go here
      console.log('Transcript view coming soon...');
    } catch (error) {
      console.error('Error loading transcript:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Loading GPA data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadGPAData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* CGPA Section */}
      {cgpa && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faTrophy} className="text-3xl mr-4" />
              <div>
                <h2 className="text-2xl font-bold">Cumulative GPA (CGPA)</h2>
                <p className="text-blue-100">Overall Academic Performance</p>
              </div>
            </div>
            <button
              onClick={() => handleViewTranscript(cgpa.id)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Transcript
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{cgpa.cgpa}</div>
              <div className="text-blue-100 text-sm">CGPA</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{cgpa.total_credits_earned}</div>
              <div className="text-blue-100 text-sm">Total Credits</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-semibold mb-2 px-3 py-1 rounded-full inline-block ${
                getClassificationColor(cgpa.classification)
              }`}>
                {cgpa.classification?.replace(/_/g, ' ') || 'N/A'}
              </div>
              <div className="text-blue-100 text-sm">Classification</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-semibold mb-2 ${
                cgpa.is_eligible_for_graduation ? 'text-green-300' : 'text-red-300'
              }`}>
                <FontAwesomeIcon 
                  icon={cgpa.is_eligible_for_graduation ? faCheckCircle : faTimes} 
                  className="mr-2" 
                />
                {cgpa.is_eligible_for_graduation ? 'Eligible' : 'Not Eligible'}
              </div>
              <div className="text-blue-100 text-sm">Graduation</div>
            </div>
          </div>
        </div>
      )}

      {/* SGPA Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Semester GPAs (SGPA)</h3>
              <p className="text-gray-600">Semester-wise Performance</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {sgpas.length} semester{sgpas.length !== 1 ? 's' : ''} completed
          </div>
        </div>

        {sgpas.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faBookOpen} className="text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">No SGPA records found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sgpas.map((sgpa) => (
              <div
                key={sgpa.id}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  selectedSGPA?.id === sgpa.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSGPA(selectedSGPA?.id === sgpa.id ? null : sgpa)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">{sgpa.semester}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{sgpa.sgpa}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Credits:</span>
                    <span className="font-medium">{sgpa.total_credits}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Standing:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getAcademicStandingColor(sgpa.academic_standing)
                    }`}>
                      {sgpa.academic_standing?.replace(/_/g, ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
                
                {selectedSGPA?.id === sgpa.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Semester:</span>
                        <span className="font-medium">{sgpa.semester}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>SGPA:</span>
                        <span className="font-medium">{sgpa.sgpa}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Total Credits:</span>
                        <span className="font-medium">{sgpa.total_credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Academic Standing:</span>
                        <span className="font-medium">{sgpa.academic_standing?.replace(/_/g, ' ') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Summary */}
      {cgpa && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <FontAwesomeIcon icon={faAward} className="text-2xl text-yellow-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Performance Summary</h3>
              <p className="text-gray-600">Academic achievement overview</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className={`text-3xl font-bold mb-2 ${getCGPAStatus(cgpa.cgpa).color}`}>
                {cgpa.cgpa}
              </div>
              <div className="text-sm text-gray-600">Current CGPA</div>
              <div className={`text-xs font-medium mt-1 ${getCGPAStatus(cgpa.cgpa).color}`}>
                {getCGPAStatus(cgpa.cgpa).status}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {sgpas.length}
              </div>
              <div className="text-sm text-gray-600">Semesters Completed</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {cgpa.total_credits_earned}
              </div>
              <div className="text-sm text-gray-600">Total Credits Earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal Placeholder */}
      {showTranscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Academic Transcript</h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-blue-500 mb-4" />
              <p className="text-gray-600">Transcript generation feature coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPADisplay;
