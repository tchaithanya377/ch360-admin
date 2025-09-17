import { useState, useEffect, useCallback } from 'react';
import facultyApiService from '../services/facultyApiService';
import { 
  getMockPerformanceRecords, 
  getMockPerformanceReviews, 
  getMockPerformanceMetrics, 
  getMockFacultyList 
} from '../utils/performanceMockData';

/**
 * Custom hook for managing faculty performance data and operations
 * Provides a centralized way to handle performance records, reviews, and metrics
 */
export const usePerformanceManagement = () => {
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all performance-related data
  const loadData = useCallback(async () => {
    console.log('🔄 Starting data load...');
    setLoading(true);
    setError(null);
    try {
      // Load data with fallbacks for missing endpoints
      console.log('📡 Attempting to load data from API...');
      const [performanceData, facultyData] = await Promise.all([
        facultyApiService.getPerformance().catch(err => {
          console.warn('⚠️ Performance endpoint not available:', err);
          return [];
        }),
        facultyApiService.getFaculty().catch(err => {
          console.warn('⚠️ Faculty endpoint not available:', err);
          return [];
        })
      ]);
      
      console.log('📊 Raw performance data from API:', performanceData);
      console.log('👥 Raw faculty data from API:', facultyData);

      // Try to load optional endpoints, but don't fail if they don't exist
      const [reviewsData, metricsData] = await Promise.allSettled([
        facultyApiService.getPerformanceReviews(),
        facultyApiService.getPerformanceMetrics()
      ]);

      let finalFacultyList = Array.isArray(facultyData) && facultyData.length > 0 
        ? facultyData 
        : facultyData?.results?.length > 0 
          ? facultyData.results 
          : getMockFacultyList();
      
      // If we have performance records but no faculty data, create faculty records from performance data
      const apiRecords = Array.isArray(performanceData) ? performanceData : performanceData?.results || [];
      if (apiRecords.length > 0 && finalFacultyList.length === 0) {
        console.log('🔄 Creating faculty records from performance data...');
        const facultyFromPerformance = apiRecords.map((record, index) => {
          if (record.faculty_name) {
            // Handle formats like "Dr.Kusuma (101ds)" or "Dr. Kusuma (101ds)"
            let cleanName = record.faculty_name.replace(/\([^)]*\)/g, '').trim(); // Remove (101ds) part
            cleanName = cleanName.replace(/^Dr\.?\s*/i, '').trim(); // Remove Dr. prefix
            
            const nameParts = cleanName.split(' ');
            return {
              id: index + 1,
              first_name: nameParts[0] || 'Unknown',
              last_name: nameParts.slice(1).join(' ') || 'Faculty',
              department: record.department || 'Unknown Department',
              email: record.evaluated_by || `faculty${index + 1}@university.edu`,
              designation: 'PROFESSOR',
              phone: '+1-555-0000',
              employee_id: `EMP${String(index + 1).padStart(3, '0')}`,
              hire_date: new Date().toISOString().split('T')[0],
              status: 'ACTIVE'
            };
          }
          return null;
        }).filter(Boolean);
        
        if (facultyFromPerformance.length > 0) {
          finalFacultyList = facultyFromPerformance;
          console.log('✅ Created faculty list from performance data:', finalFacultyList);
        }
      }
      
      console.log('✅ Final faculty list:', finalFacultyList);
      setFacultyList(finalFacultyList);

      const finalPerformanceRecords = Array.isArray(performanceData) && performanceData.length > 0 
        ? performanceData 
        : performanceData?.results?.length > 0 
          ? performanceData.results 
          : getMockPerformanceRecords(); // Use mock data if no real data available
      
      console.log('📋 Final performance records before enrichment:', finalPerformanceRecords);
      
      // Enrich performance records with faculty data - handle API response structure
      const enrichedRecords = finalPerformanceRecords.map((record, index) => {
        let faculty = record.faculty;
        
        // Log the record structure for debugging
        console.log(`🔍 Record ${record.id} structure:`, {
          id: record.id,
          faculty_id: record.faculty_id,
          faculty: record.faculty,
          faculty_name: record.faculty_name,
          keys: Object.keys(record)
        });
        
        // Log the faculty list for debugging
        console.log(`👥 Available faculty list:`, finalFacultyList.map(f => ({
          id: f.id,
          first_name: f.first_name,
          last_name: f.last_name,
          department: f.department
        })));
        
        // If no faculty object or faculty object is incomplete, try to find it
        if (!faculty || !faculty.first_name || !faculty.last_name) {
          // Try different ways to find faculty
          if (record.faculty_id) {
            console.log(`🔍 Looking for faculty with ID: ${record.faculty_id}`);
            faculty = finalFacultyList.find(f => f.id === record.faculty_id);
            console.log(`🔍 Found faculty by ID:`, faculty);
          } else if (record.faculty_name) {
            // Try to match by name if faculty_id is not available
            // Handle formats like "Dr.Kusuma (101ds)" or "Dr. Kusuma (101ds)"
            console.log(`🔍 Looking for faculty with name: ${record.faculty_name}`);
            let cleanName = record.faculty_name.replace(/\([^)]*\)/g, '').trim(); // Remove (101ds) part
            cleanName = cleanName.replace(/^Dr\.?\s*/i, '').trim(); // Remove Dr. prefix
            console.log(`🔍 Cleaned name: ${cleanName}`);
            
            const nameParts = cleanName.split(' ');
            console.log(`🔍 Name parts:`, nameParts);
            if (nameParts.length >= 1) {
              // Try exact match first
              faculty = finalFacultyList.find(f => 
                f.first_name === nameParts[0] && (nameParts[1] ? f.last_name === nameParts[1] : true)
              );
              console.log(`🔍 Found faculty by exact name match:`, faculty);
              
              // If no exact match, try partial match
              if (!faculty) {
                faculty = finalFacultyList.find(f => 
                  f.first_name.toLowerCase().includes(nameParts[0].toLowerCase()) ||
                  f.last_name.toLowerCase().includes(nameParts[0].toLowerCase())
                );
                console.log(`🔍 Found faculty by partial name match:`, faculty);
              }
            }
          }
          
          // If still no faculty found, assign one from the list (round-robin)
          if (!faculty && finalFacultyList.length > 0) {
            faculty = finalFacultyList[index % finalFacultyList.length];
            console.log(`🔄 Assigning faculty ${faculty.first_name} ${faculty.last_name} to record ${record.id} (round-robin)`);
          }
          
          console.log(`🔗 Enriching record ${record.id} with faculty:`, faculty);
        }
        
        // Ensure faculty object has all required fields
        if (faculty) {
          const enrichedRecord = { 
            ...record, 
            faculty_id: faculty.id, // Ensure faculty_id is set
            faculty: {
              id: faculty.id,
              first_name: faculty.first_name,
              last_name: faculty.last_name,
              department: faculty.department,
              email: faculty.email,
              designation: faculty.designation
            }
          };
          console.log(`✅ Enriched record ${record.id} with faculty:`, {
            faculty_id: enrichedRecord.faculty_id,
            faculty_name: `${enrichedRecord.faculty.first_name} ${enrichedRecord.faculty.last_name}`,
            department: enrichedRecord.faculty.department
          });
          return enrichedRecord;
        }
        
        console.warn(`⚠️ No faculty found for record ${record.id} with faculty_id ${record.faculty_id}`);
        return record;
      });
      
      console.log('✅ Final enriched performance records:', enrichedRecords);
      setPerformanceRecords(enrichedRecords);
      setPerformanceReviews(
        reviewsData.status === 'fulfilled' 
          ? (Array.isArray(reviewsData.value) ? reviewsData.value : reviewsData.value?.results || [])
          : getMockPerformanceReviews() // Use mock data if endpoint not available
      );
      setPerformanceMetrics(
        metricsData.status === 'fulfilled'
          ? (Array.isArray(metricsData.value) ? metricsData.value : metricsData.value?.results || [])
          : getMockPerformanceMetrics() // Use mock data if endpoint not available
      );
    } catch (err) {
      console.error('❌ Error loading performance data:', err);
      setError('Failed to load performance data. Using sample data instead.');
      
      // Fallback to mock data in case of complete failure
      console.log('🔄 Falling back to mock data...');
      const mockRecords = getMockPerformanceRecords();
      const mockFaculty = getMockFacultyList();
      const mockReviews = getMockPerformanceReviews();
      const mockMetrics = getMockPerformanceMetrics();
      
      console.log('📋 Mock performance records:', mockRecords);
      console.log('👥 Mock faculty list:', mockFaculty);
      
      setPerformanceRecords(mockRecords);
      setPerformanceReviews(mockReviews);
      setPerformanceMetrics(mockMetrics);
      setFacultyList(mockFaculty);
    } finally {
      console.log('✅ Data loading completed');
      setLoading(false);
    }
  }, []);

  // Force load mock data for testing
  const loadMockData = useCallback(() => {
    console.log('🧪 Force loading mock data for testing...');
    setLoading(true);
    setError(null);
    
    const mockRecords = getMockPerformanceRecords();
    const mockFaculty = getMockFacultyList();
    const mockReviews = getMockPerformanceReviews();
    const mockMetrics = getMockPerformanceMetrics();
    
    console.log('📋 Loading mock performance records:', mockRecords);
    console.log('👥 Loading mock faculty list:', mockFaculty);
    
    setPerformanceRecords(mockRecords);
    setPerformanceReviews(mockReviews);
    setPerformanceMetrics(mockMetrics);
    setFacultyList(mockFaculty);
    setLoading(false);
  }, []);

  // Generate fresh dynamic data
  const refreshDynamicData = useCallback(() => {
    console.log('🔄 Refreshing dynamic data...');
    setLoading(true);
    setError(null);
    
    // Generate fresh dynamic data
    const freshRecords = getMockPerformanceRecords();
    const freshFaculty = getMockFacultyList();
    const freshReviews = getMockPerformanceReviews();
    const freshMetrics = getMockPerformanceMetrics();
    
    console.log('🆕 Fresh dynamic performance records:', freshRecords);
    console.log('🆕 Fresh faculty list:', freshFaculty);
    
    setPerformanceRecords(freshRecords);
    setPerformanceReviews(freshReviews);
    setPerformanceMetrics(freshMetrics);
    setFacultyList(freshFaculty);
    setLoading(false);
  }, []);

  // Force use API data (bypass mock data)
  const forceUseApiData = useCallback(async () => {
    console.log('🌐 Force loading API data...');
    setLoading(true);
    setError(null);
    
    try {
      // Force load from API only
      const [performanceData, facultyData] = await Promise.all([
        facultyApiService.getPerformance(),
        facultyApiService.getFaculty()
      ]);
      
      console.log('🌐 API performance data:', performanceData);
      console.log('🌐 API faculty data:', facultyData);
      
      // Process API data directly
      const apiFacultyList = Array.isArray(facultyData) ? facultyData : facultyData?.results || [];
      const apiPerformanceRecords = Array.isArray(performanceData) ? performanceData : performanceData?.results || [];
      
      // Create faculty records from performance data if needed
      let finalFacultyList = apiFacultyList;
      if (apiPerformanceRecords.length > 0 && finalFacultyList.length === 0) {
        console.log('🔄 Creating faculty records from API performance data...');
        const facultyFromPerformance = apiPerformanceRecords.map((record, index) => {
          if (record.faculty_name) {
            let cleanName = record.faculty_name.replace(/\([^)]*\)/g, '').trim();
            cleanName = cleanName.replace(/^Dr\.?\s*/i, '').trim();
            const nameParts = cleanName.split(' ');
            return {
              id: index + 1,
              first_name: nameParts[0] || 'Unknown',
              last_name: nameParts.slice(1).join(' ') || 'Faculty',
              department: record.department || 'Unknown Department',
              email: record.evaluated_by || `faculty${index + 1}@university.edu`,
              designation: 'PROFESSOR',
              phone: '+1-555-0000',
              employee_id: `EMP${String(index + 1).padStart(3, '0')}`,
              hire_date: new Date().toISOString().split('T')[0],
              status: 'ACTIVE'
            };
          }
          return null;
        }).filter(Boolean);
        
        if (facultyFromPerformance.length > 0) {
          finalFacultyList = facultyFromPerformance;
        }
      }
      
      // Enrich performance records with faculty data
      const enrichedRecords = apiPerformanceRecords.map((record, index) => {
        let faculty = record.faculty;
        
        if (!faculty || !faculty.first_name || !faculty.last_name) {
          if (record.faculty_name) {
            let cleanName = record.faculty_name.replace(/\([^)]*\)/g, '').trim();
            cleanName = cleanName.replace(/^Dr\.?\s*/i, '').trim();
            const nameParts = cleanName.split(' ');
            
            faculty = finalFacultyList.find(f => 
              f.first_name === nameParts[0] && (nameParts[1] ? f.last_name === nameParts[1] : true)
            );
            
            if (!faculty) {
              faculty = finalFacultyList.find(f => 
                f.first_name.toLowerCase().includes(nameParts[0].toLowerCase()) ||
                f.last_name.toLowerCase().includes(nameParts[0].toLowerCase())
              );
            }
          }
          
          if (!faculty && finalFacultyList.length > 0) {
            faculty = finalFacultyList[index % finalFacultyList.length];
          }
        }
        
        if (faculty) {
          return { 
            ...record, 
            faculty_id: faculty.id,
            faculty: {
              id: faculty.id,
              first_name: faculty.first_name,
              last_name: faculty.last_name,
              department: faculty.department,
              email: faculty.email,
              designation: faculty.designation
            }
          };
        }
        
        return record;
      });
      
      setPerformanceRecords(enrichedRecords);
      setPerformanceReviews([]);
      setPerformanceMetrics([]);
      setFacultyList(finalFacultyList);
      
    } catch (err) {
      console.error('❌ Error loading API data:', err);
      setError('Failed to load API data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create performance record
  const createPerformanceRecord = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await facultyApiService.createPerformance(data);
      await loadData();
      return result;
    } catch (err) {
      console.error('Error creating performance record:', err);
      setError('Failed to create performance record. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Update performance record
  const updatePerformanceRecord = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const result = await facultyApiService.updatePerformance(id, data);
      await loadData();
      return result;
    } catch (err) {
      console.error('Error updating performance record:', err);
      setError('Failed to update performance record. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Delete performance record
  const deletePerformanceRecord = useCallback(async (id) => {
    try {
      setLoading(true);
      await facultyApiService.deletePerformance(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting performance record:', err);
      setError('Failed to delete performance record. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Create performance review
  const createPerformanceReview = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await facultyApiService.createPerformanceReview(data);
      await loadData();
      return result;
    } catch (err) {
      console.error('Error creating performance review:', err);
      if (err.status === 404) {
        setError('Performance reviews feature is not yet available on the server.');
      } else {
        setError('Failed to create performance review. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Update performance review
  const updatePerformanceReview = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const result = await facultyApiService.updatePerformanceReview(id, data);
      await loadData();
      return result;
    } catch (err) {
      console.error('Error updating performance review:', err);
      if (err.status === 404) {
        setError('Performance reviews feature is not yet available on the server.');
      } else {
        setError('Failed to update performance review. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Delete performance review
  const deletePerformanceReview = useCallback(async (id) => {
    try {
      setLoading(true);
      await facultyApiService.deletePerformanceReview(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting performance review:', err);
      if (err.status === 404) {
        setError('Performance reviews feature is not yet available on the server.');
      } else {
        setError('Failed to delete performance review. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Create performance metric
  const createPerformanceMetric = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await facultyApiService.createPerformanceMetric(data);
      await loadData();
      return result;
    } catch (err) {
      console.error('Error creating performance metric:', err);
      if (err.status === 404) {
        setError('Performance metrics feature is not yet available on the server.');
      } else {
        setError('Failed to create performance metric. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Generate performance report
  const generatePerformanceReport = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await facultyApiService.generatePerformanceReport(data);
      return result;
    } catch (err) {
      console.error('Error generating performance report:', err);
      if (err.status === 404) {
        setError('Performance reports feature is not yet available on the server.');
      } else {
        setError('Failed to generate performance report. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get performance statistics
  const getPerformanceStats = useCallback(() => {
    const stats = {
      totalRecords: performanceRecords.length,
      totalReviews: performanceReviews.length,
      totalMetrics: performanceMetrics.length,
      averageScore: 0,
      scoreDistribution: {
        excellent: 0, // 80-100
        good: 0,      // 60-79
        needsImprovement: 0 // 0-59
      },
      departmentStats: {},
      statusDistribution: {
        completed: 0,
        inProgress: 0,
        draft: 0
      }
    };

    if (performanceRecords.length > 0) {
      // Calculate average score
      const totalScore = performanceRecords.reduce((sum, record) => sum + (record.overall_score || 0), 0);
      stats.averageScore = Math.round(totalScore / performanceRecords.length);

      // Calculate score distribution (using 0-10 scale)
      performanceRecords.forEach(record => {
        const score = record.overall_score || 0;
        if (score >= 8) stats.scoreDistribution.excellent++;
        else if (score >= 6) stats.scoreDistribution.good++;
        else stats.scoreDistribution.needsImprovement++;
      });

      // Calculate department stats
      performanceRecords.forEach(record => {
        const dept = record.department || record.faculty?.department || 'Unknown';
        if (!stats.departmentStats[dept]) {
          stats.departmentStats[dept] = {
            count: 0,
            averageScore: 0,
            totalScore: 0
          };
        }
        stats.departmentStats[dept].count++;
        stats.departmentStats[dept].totalScore += record.overall_score || 0;
      });

      // Calculate average scores per department
      Object.keys(stats.departmentStats).forEach(dept => {
        const deptStats = stats.departmentStats[dept];
        deptStats.averageScore = Math.round((deptStats.totalScore / deptStats.count) * 10) / 10;
      });

      // Calculate status distribution
      performanceRecords.forEach(record => {
        const status = record.status?.toLowerCase();
        if (status === 'completed') stats.statusDistribution.completed++;
        else if (status === 'in_progress') stats.statusDistribution.inProgress++;
        else if (status === 'draft') stats.statusDistribution.draft++;
      });
    }

    return stats;
  }, [performanceRecords]);

  // Filter performance records
  const filterPerformanceRecords = useCallback((filters = {}) => {
    return performanceRecords.filter(record => {
      // Get the display name for search
      const displayName = record.faculty ? 
        `${record.faculty.first_name} ${record.faculty.last_name}` : 
        (record.faculty_name ? 
          record.faculty_name.replace(/\([^)]*\)/g, '').replace(/^Dr\.?\s*/i, '').trim() : 
          `Faculty ID: ${record.faculty_id}`);
      
      const matchesSearch = !filters.search || 
        displayName.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.faculty_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.faculty_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
        `${record.faculty?.first_name} ${record.faculty?.last_name}`.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesDepartment = !filters.department || 
        (record.faculty?.department || record.department) === filters.department;
      
      const matchesYear = !filters.year || record.academic_year === filters.year;
      
      const matchesStatus = !filters.status || record.status === filters.status;
      
      const matchesScoreRange = !filters.minScore || !filters.maxScore || 
        (record.overall_score >= filters.minScore && record.overall_score <= filters.maxScore);

      return matchesSearch && matchesDepartment && matchesYear && matchesStatus && matchesScoreRange;
    });
  }, [performanceRecords]);

  // Get faculty performance history
  const getFacultyPerformanceHistory = useCallback((facultyId) => {
    return performanceRecords
      .filter(record => record.faculty_id === facultyId || record.faculty?.id === facultyId)
      .sort((a, b) => new Date(b.academic_year) - new Date(a.academic_year));
  }, [performanceRecords]);

  // Get performance reviews for a specific record
  const getPerformanceReviewsForRecord = useCallback((recordId) => {
    return performanceReviews.filter(review => review.performance_record_id === recordId);
  }, [performanceReviews]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    performanceRecords,
    performanceReviews,
    performanceMetrics,
    facultyList,
    loading,
    error,
    
    // Actions
    loadData,
    loadMockData,
    refreshDynamicData,
    forceUseApiData,
    createPerformanceRecord,
    updatePerformanceRecord,
    deletePerformanceRecord,
    createPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,
    createPerformanceMetric,
    generatePerformanceReport,
    
    // Utilities
    getPerformanceStats,
    filterPerformanceRecords,
    getFacultyPerformanceHistory,
    getPerformanceReviewsForRecord,
    clearError
  };
};

export default usePerformanceManagement;
