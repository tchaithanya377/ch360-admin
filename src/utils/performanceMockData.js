/**
 * Mock data provider for Faculty Performance Management
 * Used when backend endpoints are not available
 * This creates dynamic data instead of static data
 */

// Generate dynamic performance records
const generateDynamicPerformanceRecords = () => {
  const facultyList = getMockFacultyList();
  const academicYears = ["2023-2024", "2024-2025"];
  const evaluationPeriods = ["Q1", "Q2", "Q3", "Q4", "Annual"];
  const statuses = ["COMPLETED", "IN_PROGRESS", "DRAFT"];
  
  return facultyList.map((faculty, index) => ({
    id: index + 1,
    faculty_id: faculty.id,
    academic_year: academicYears[index % academicYears.length],
    evaluation_period: evaluationPeriods[index % evaluationPeriods.length],
    teaching_effectiveness: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
    student_satisfaction: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
    research_contribution: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
    administrative_work: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
    professional_development: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
    overall_score: 0, // Will be calculated
    strengths: `Strong performance in ${faculty.department} with excellent student engagement`,
    areas_for_improvement: `Focus on improving administrative efficiency and research output`,
    recommendations: `Continue professional development and consider mentoring junior faculty`,
    evaluated_by: `Dr. ${facultyList[(index + 1) % facultyList.length].first_name} ${facultyList[(index + 1) % facultyList.length].last_name}`,
    evaluation_date: new Date(2024, 0, 15 + index * 5).toISOString().split('T')[0],
    comments: `Overall strong performance with room for improvement in specific areas`,
    status: statuses[index % statuses.length],
    faculty: {
      id: faculty.id,
      first_name: faculty.first_name,
      last_name: faculty.last_name,
      department: faculty.department
    }
  })).map(record => ({
    ...record,
    overall_score: Math.round(((record.teaching_effectiveness + record.student_satisfaction + record.research_contribution + record.administrative_work + record.professional_development) / 5) * 10) / 10
  }));
};

export const getMockPerformanceRecords = () => {
  console.log('🔄 Generating dynamic performance records...');
  const dynamicRecords = generateDynamicPerformanceRecords();
  console.log('✅ Generated dynamic performance records:', dynamicRecords);
  return dynamicRecords;
};

export const getMockPerformanceReviews = () => {
  const facultyList = getMockFacultyList();
  const performanceRecords = getMockPerformanceRecords();
  
  return performanceRecords.map((record, index) => ({
    id: index + 1,
    performance_record_id: record.id,
    reviewer_id: facultyList[(index + 1) % facultyList.length].id,
    review_date: new Date(2024, 0, 16 + index * 5).toISOString().split('T')[0],
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
    comments: `Excellent performance in ${record.faculty.department} with strong ${record.overall_score >= 8 ? 'overall' : 'developing'} capabilities`,
    status: "COMPLETED",
    reviewer_name: `Dr. ${facultyList[(index + 1) % facultyList.length].first_name} ${facultyList[(index + 1) % facultyList.length].last_name}`,
    faculty_name: `Dr. ${record.faculty.first_name} ${record.faculty.last_name}`
  }));
};

export const getMockPerformanceMetrics = () => [
  {
    id: 1,
    name: "Teaching Effectiveness",
    category: "TEACHING",
    weight: 30,
    description: "Evaluation of teaching quality and student engagement",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Research Contribution",
    category: "RESEARCH",
    weight: 25,
    description: "Assessment of research publications and contributions",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Administrative Work",
    category: "ADMINISTRATION",
    weight: 20,
    description: "Evaluation of administrative responsibilities and efficiency",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Student Satisfaction",
    category: "TEACHING",
    weight: 15,
    description: "Student feedback and satisfaction ratings",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Professional Development",
    category: "SERVICE",
    weight: 10,
    description: "Continuous learning and professional growth",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const getMockFacultyList = () => [
  {
    id: 1,
    first_name: "John",
    last_name: "Smith",
    department: "Computer Science",
    email: "john.smith@university.edu",
    designation: "PROFESSOR",
    phone: "+1-555-0101",
    employee_id: "EMP001",
    hire_date: "2020-01-15",
    status: "ACTIVE"
  },
  {
    id: 2,
    first_name: "Sarah",
    last_name: "Johnson",
    department: "Mathematics",
    email: "sarah.johnson@university.edu",
    designation: "ASSOCIATE_PROFESSOR",
    phone: "+1-555-0102",
    employee_id: "EMP002",
    hire_date: "2021-03-20",
    status: "ACTIVE"
  },
  {
    id: 3,
    first_name: "Michael",
    last_name: "Brown",
    department: "Physics",
    email: "michael.brown@university.edu",
    designation: "ASSISTANT_PROFESSOR",
    phone: "+1-555-0103",
    employee_id: "EMP003",
    hire_date: "2022-08-10",
    status: "ACTIVE"
  },
  {
    id: 4,
    first_name: "Emily",
    last_name: "Davis",
    department: "Chemistry",
    email: "emily.davis@university.edu",
    designation: "ASSOCIATE_PROFESSOR",
    phone: "+1-555-0104",
    employee_id: "EMP004",
    hire_date: "2019-09-05",
    status: "ACTIVE"
  },
  {
    id: 5,
    first_name: "David",
    last_name: "Wilson",
    department: "Biology",
    email: "david.wilson@university.edu",
    designation: "PROFESSOR",
    phone: "+1-555-0105",
    employee_id: "EMP005",
    hire_date: "2018-01-10",
    status: "ACTIVE"
  }
];

export default {
  getMockPerformanceRecords,
  getMockPerformanceReviews,
  getMockPerformanceMetrics,
  getMockFacultyList
};
