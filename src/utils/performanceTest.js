/**
 * Performance Management System Test Suite
 * Tests all CRUD operations and functionality for faculty performance management
 */

import facultyApiService from '../services/facultyApiService';

class PerformanceTestSuite {
  constructor() {
    this.testResults = [];
    this.testData = {
      performanceRecord: {
        faculty_id: 1,
        academic_year: new Date().getFullYear(),
        semester: "1",
        teaching_score: 85,
        research_score: 90,
        service_score: 75,
        overall_score: 83,
        status: "DRAFT",
        comments: "Test performance record for automated testing"
      },
      performanceReview: {
        performance_record_id: null, // Will be set after creating a record
        reviewer_id: 2,
        review_date: new Date().toISOString().split('T')[0],
        rating: 4,
        comments: "Test review for automated testing",
        status: "COMPLETED"
      },
      performanceMetric: {
        name: "Test Metric",
        category: "TEACHING",
        weight: 25,
        description: "Test metric for automated testing"
      }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Performance Management Test Suite...');
    
    try {
      await this.testPerformanceRecords();
      await this.testPerformanceReviews();
      await this.testPerformanceMetrics();
      await this.testPerformanceReports();
      await this.testPerformanceFiltering();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testPerformanceRecords() {
    console.log('📊 Testing Performance Records CRUD...');
    
    try {
      // Test CREATE
      const createResult = await facultyApiService.createPerformance(this.testData.performanceRecord);
      this.addTestResult('CREATE Performance Record', true, 'Successfully created performance record', createResult);
      
      const recordId = createResult.id || createResult.data?.id;
      this.testData.performanceReview.performance_record_id = recordId;
      
      // Test READ
      const readResult = await facultyApiService.getPerformance();
      this.addTestResult('READ Performance Records', true, `Retrieved ${readResult.length || readResult.results?.length || 0} records`, readResult);
      
      // Test READ by ID
      if (recordId) {
        const readByIdResult = await facultyApiService.getPerformanceById(recordId);
        this.addTestResult('READ Performance Record by ID', true, 'Successfully retrieved record by ID', readByIdResult);
        
        // Test UPDATE
        const updateData = { ...this.testData.performanceRecord, overall_score: 88, status: "COMPLETED" };
        const updateResult = await facultyApiService.updatePerformance(recordId, updateData);
        this.addTestResult('UPDATE Performance Record', true, 'Successfully updated performance record', updateResult);
        
        // Test DELETE
        await facultyApiService.deletePerformance(recordId);
        this.addTestResult('DELETE Performance Record', true, 'Successfully deleted performance record', null);
      }
      
    } catch (error) {
      this.addTestResult('Performance Records CRUD', false, `Error: ${error.message}`, error);
    }
  }

  async testPerformanceReviews() {
    console.log('📝 Testing Performance Reviews CRUD...');
    
    try {
      // First create a performance record for the review
      const recordResult = await facultyApiService.createPerformance(this.testData.performanceRecord);
      const recordId = recordResult.id || recordResult.data?.id;
      this.testData.performanceReview.performance_record_id = recordId;
      
      // Test CREATE Review
      const createResult = await facultyApiService.createPerformanceReview(this.testData.performanceReview);
      this.addTestResult('CREATE Performance Review', true, 'Successfully created performance review', createResult);
      
      const reviewId = createResult.id || createResult.data?.id;
      
      // Test READ Reviews
      const readResult = await facultyApiService.getPerformanceReviews();
      this.addTestResult('READ Performance Reviews', true, `Retrieved ${readResult.length || readResult.results?.length || 0} reviews`, readResult);
      
      // Test READ Review by ID
      if (reviewId) {
        const readByIdResult = await facultyApiService.getPerformanceReviewById(reviewId);
        this.addTestResult('READ Performance Review by ID', true, 'Successfully retrieved review by ID', readByIdResult);
        
        // Test UPDATE Review
        const updateData = { ...this.testData.performanceReview, rating: 5, comments: "Updated test review" };
        const updateResult = await facultyApiService.updatePerformanceReview(reviewId, updateData);
        this.addTestResult('UPDATE Performance Review', true, 'Successfully updated performance review', updateResult);
        
        // Test DELETE Review
        await facultyApiService.deletePerformanceReview(reviewId);
        this.addTestResult('DELETE Performance Review', true, 'Successfully deleted performance review', null);
      }
      
      // Clean up the performance record
      if (recordId) {
        await facultyApiService.deletePerformance(recordId);
      }
      
    } catch (error) {
      this.addTestResult('Performance Reviews CRUD', false, `Error: ${error.message}`, error);
    }
  }

  async testPerformanceMetrics() {
    console.log('📈 Testing Performance Metrics CRUD...');
    
    try {
      // Test CREATE Metric
      const createResult = await facultyApiService.createPerformanceMetric(this.testData.performanceMetric);
      this.addTestResult('CREATE Performance Metric', true, 'Successfully created performance metric', createResult);
      
      // Test READ Metrics
      const readResult = await facultyApiService.getPerformanceMetrics();
      this.addTestResult('READ Performance Metrics', true, `Retrieved ${readResult.length || readResult.results?.length || 0} metrics`, readResult);
      
    } catch (error) {
      this.addTestResult('Performance Metrics CRUD', false, `Error: ${error.message}`, error);
    }
  }

  async testPerformanceReports() {
    console.log('📋 Testing Performance Reports...');
    
    try {
      // Test READ Reports
      const readResult = await facultyApiService.getPerformanceReports();
      this.addTestResult('READ Performance Reports', true, `Retrieved ${readResult.length || readResult.results?.length || 0} reports`, readResult);
      
      // Test GENERATE Report
      const reportData = {
        academic_year: new Date().getFullYear(),
        department: "Computer Science",
        format: "PDF"
      };
      
      try {
        const generateResult = await facultyApiService.generatePerformanceReport(reportData);
        this.addTestResult('GENERATE Performance Report', true, 'Successfully generated performance report', generateResult);
      } catch (generateError) {
        // This might fail if the endpoint doesn't exist yet, which is okay
        this.addTestResult('GENERATE Performance Report', false, `Generate endpoint not available: ${generateError.message}`, generateError);
      }
      
    } catch (error) {
      this.addTestResult('Performance Reports', false, `Error: ${error.message}`, error);
    }
  }

  async testPerformanceFiltering() {
    console.log('🔍 Testing Performance Filtering...');
    
    try {
      // Test filtering by year
      const yearFilter = await facultyApiService.getPerformance({ academic_year: new Date().getFullYear() });
      this.addTestResult('Filter by Academic Year', true, `Filtered records for current year`, yearFilter);
      
      // Test filtering by status
      const statusFilter = await facultyApiService.getPerformance({ status: "COMPLETED" });
      this.addTestResult('Filter by Status', true, `Filtered records by status`, statusFilter);
      
      // Test filtering by faculty
      const facultyFilter = await facultyApiService.getPerformance({ faculty_id: 1 });
      this.addTestResult('Filter by Faculty ID', true, `Filtered records by faculty`, facultyFilter);
      
    } catch (error) {
      this.addTestResult('Performance Filtering', false, `Error: ${error.message}`, error);
    }
  }

  addTestResult(testName, passed, message, data = null) {
    this.testResults.push({
      test: testName,
      passed,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : null,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  printResults() {
    console.log('\n📊 Performance Management Test Results:');
    console.log('=====================================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`- ${result.test}: ${result.message}`);
      });
    }
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      console.log(`   Message: ${result.message}`);
      if (result.data) {
        console.log(`   Data: ${result.data.substring(0, 100)}${result.data.length > 100 ? '...' : ''}`);
      }
      console.log(`   Time: ${result.timestamp}`);
      console.log('');
    });
  }

  // Utility method to test the hook functionality
  async testPerformanceHook() {
    console.log('🪝 Testing Performance Management Hook...');
    
    try {
      // This would test the usePerformanceManagement hook
      // Since we can't directly test React hooks here, we'll test the underlying API calls
      const hookTestData = await facultyApiService.getPerformance();
      this.addTestResult('Hook Data Loading', true, 'Hook can load performance data', hookTestData);
      
    } catch (error) {
      this.addTestResult('Hook Data Loading', false, `Hook test failed: ${error.message}`, error);
    }
  }
}

// Export for use in other files
export default PerformanceTestSuite;

// Auto-run if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  window.PerformanceTestSuite = PerformanceTestSuite;
  console.log('Performance Test Suite loaded. Run: new PerformanceTestSuite().runAllTests()');
} else {
  // Node environment
  console.log('Performance Test Suite loaded for Node.js environment');
}
