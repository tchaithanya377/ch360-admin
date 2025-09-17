import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "./utils/queryClient";
import { LoadingSpinner } from "./components/LazyComponent";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import { DjangoAuthProvider, useDjangoAuth } from "./contexts/DjangoAuthContext";
import AccessGuard from "./components/AccessGuard.jsx";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import "./utils/fonts"; // Import font optimizations
const AdminNavbar = lazy(() => import("./components/ModernNavbar.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));
const Login = lazy(() => import("./components/Login.jsx"))
const Students = lazy(() => import("./components/StudentManagement/StudentDashboardDjango.jsx"));
const StudentManagement = lazy(() => import("./components/StudentManagement.jsx"));
const StudentRegistration = lazy(() => import("./components/StudentRegistration.jsx"));
const FormCustomizer = lazy(() => import("./components/FormCustomizer.jsx"));
const Faculty = lazy(() => import("./components/Faculty-manage.jsx"));
const FacultyManagement = lazy(() => import("./components/FacultyManagement.jsx"));
const FacultyViewer = lazy(() => import("./components/FacultyViewer.jsx"));
const AddFaculty = lazy(() => import("./components/AddFacultyDjango.jsx"));
// Courses removed
const Relationships = lazy(() => import("./components/Relationships.jsx"));
const FacultyAssignments = lazy(() => import("./components/FacultyAssignments.jsx"));
const NoDues = lazy(() => import("./components/NoDues.jsx"));
const NoDuesManagement = lazy(() => import("./components/NoDuesManagement.jsx"));
// Timetable removed
// Create User removed
const AttendanceModule = lazy(() => import("./components/Attendance/index.jsx"));
const CoordinatorAssignment = lazy(() => import("./components/CoordinatorAssignment.jsx"));
// Mentoring module
const MentorDashboard = lazy(() => import("./components/Mentoring/MentorDashboard.jsx"));
const MentorshipDetail = lazy(() => import("./components/Mentoring/MentorshipDetail.jsx"));
const HodMentoringAnalytics = lazy(() => import("./components/Mentoring/HodMentoringAnalytics.jsx"));
const AdminMentoringAutoAssign = lazy(() => import("./components/Mentoring/AdminMentoringAutoAssign.jsx"));
const MakeAdmin = lazy(() => import("./components/MakeAdmin.jsx"));
const UserList = lazy(() => import("./components/UserList.jsx"));
const NoduesCURD = lazy(() => import("./components/NoduesCURD.jsx"));
// Transport Management
const TransportManagement = lazy(() => import("./components/TransportManagement/pages/TransportManagement.jsx"));
const VehiclesPage = lazy(() => import("./components/TransportManagement/pages/VehiclesPage.jsx"));
const DriversPage = lazy(() => import("./components/TransportManagement/pages/DriversPage.jsx"));
const StopsPage = lazy(() => import("./components/TransportManagement/pages/StopsPage.jsx"));
const RoutesPage = lazy(() => import("./components/TransportManagement/pages/RoutesPage.jsx"));
const RouteDetailPage = lazy(() => import("./components/TransportManagement/pages/RouteDetailPage.jsx"));
const AssignmentsPage = lazy(() => import("./components/TransportManagement/pages/AssignmentsPage.jsx"));
const SchedulesPage = lazy(() => import("./components/TransportManagement/pages/SchedulesPage.jsx"));
const PassesPage = lazy(() => import("./components/TransportManagement/pages/PassesPage.jsx"));
const HostelManagement = lazy(() => import("./components/HostelManagement.jsx"));
// Syllabus Management removed
const GradesManagement = lazy(() => import("./components/GradesManagement/GradesManagement.jsx"));
const FeesManagement = lazy(() => import("./components/FeesManagement/FeesManagement.jsx"));
const ResearchDevelopment = lazy(() => import("./components/RnD/ResearchDevelopment.jsx"));
const PlacementsManagement = lazy(() => import("./components/PlacementsManagement/PlacementsManagement.jsx"));
const UserProfile = lazy(() => import("./components/UserProfile.jsx"));
// Utilities/testing pages removed
const SuperuserStudentList = lazy(() => import("./components/SuperuserStudentList.jsx"));
const Logout = lazy(() => import("./components/Logout.jsx"));
const DepartmentManagement = lazy(() => import("./components/DepartmentManagement/DepartmentManagement.jsx"));
const DepartmentResources = lazy(() => import("./components/DepartmentManagement/DepartmentResources.jsx"));
const DepartmentAnnouncements = lazy(() => import("./components/DepartmentManagement/DepartmentAnnouncements.jsx"));
const DepartmentEvents = lazy(() => import("./components/DepartmentManagement/DepartmentEvents.jsx"));
const DepartmentDocuments = lazy(() => import("./components/DepartmentManagement/DepartmentDocuments.jsx"));
const DepartmentStats = lazy(() => import("./components/DepartmentManagement/DepartmentStats.jsx"));
const DepartmentApiTest = lazy(() => import("./components/DepartmentManagement/DepartmentApiTest.jsx"));
const AcademicManagementDashboard = lazy(() => import("./components/AcademicManagement/AcademicManagementDashboard.jsx"));
const CoursesManagement = lazy(() => import("./components/AcademicManagement/CoursesManagementNew.jsx"));
const SyllabiManagement = lazy(() => import("./components/AcademicManagement/SyllabiManagement.jsx"));
const SyllabusTopicsManagement = lazy(() => import("./components/AcademicManagement/SyllabusTopicsManagement.jsx"));
const TimetablesManagement = lazy(() => import("./components/AcademicManagement/TimetablesManagement.jsx"));
const EnrollmentsManagement = lazy(() => import("./components/AcademicManagement/EnrollmentsManagement.jsx"));
const AcademicCalendarManagement = lazy(() => import("./components/AcademicManagement/AcademicCalendarManagement.jsx"));
const AcademicAnalytics = lazy(() => import("./components/AcademicManagement/AcademicAnalytics.jsx"));
const CourseSectionsManagement = lazy(() => import("./components/AcademicManagement/CourseSectionsManagement.jsx"));
const BatchEnrollmentsManagement = lazy(() => import("./components/AcademicManagement/BatchEnrollmentsManagement.jsx"));
const AssignmentsManagement = lazy(() => import("./components/AssignmentsManagement/AssignmentsManagement.jsx"));
const AssignmentsOnePage = lazy(() => import("./components/AssignmentsManagement/AssignmentsOnePage.jsx"));
const AssignmentCategories = lazy(() => import("./components/AssignmentsManagement/AssignmentCategories.jsx"));
const AssignmentTemplates = lazy(() => import("./components/AssignmentsManagement/AssignmentTemplates.jsx"));
const AssignmentsCRUD = lazy(() => import("./components/AssignmentsManagement/AssignmentsCRUD.jsx"));
const AssignmentSubmissions = lazy(() => import("./components/AssignmentsManagement/AssignmentSubmissions.jsx"));
const AssignmentGrading = lazy(() => import("./components/AssignmentsManagement/AssignmentGrading.jsx"));
const AssignmentStatistics = lazy(() => import("./components/AssignmentsManagement/AssignmentStatistics.jsx"));

// Exams module (lazy)
const ExamsDashboard = lazy(() => import("./components/Exams/ExamsDashboard.jsx"));
const ExamSessionsPage = lazy(() => import("./components/Exams/ExamSessionsPage.jsx"));
const ExamSchedulesPage = lazy(() => import("./components/Exams/ExamSchedulesPage.jsx"));
const ExamRegistrationsPage = lazy(() => import("./components/Exams/ExamRegistrationsPage.jsx"));
const ExamRoomsPage = lazy(() => import("./components/Exams/ExamRoomsPage.jsx"));
const ExamStaffPage = lazy(() => import("./components/Exams/ExamStaffPage.jsx"));
const HallTicketsPage = lazy(() => import("./components/Exams/HallTicketsPage.jsx"));
const ExamAttendancePage = lazy(() => import("./components/Exams/ExamAttendancePage.jsx"));
const ExamViolationsPage = lazy(() => import("./components/Exams/ExamViolationsPage.jsx"));
const ExamResultsPage = lazy(() => import("./components/Exams/ExamResultsPage.jsx"));


// Events module
const EventsList = lazy(() => import("./components/Events/EventsList.jsx"));
const EventForm = lazy(() => import("./components/Events/EventForm.jsx"));
const EventDetail = lazy(() => import("./components/Events/EventDetail.jsx"));
const Venues = lazy(() => import("./components/Events/Venues.jsx"));
const Categories = lazy(() => import("./components/Events/Categories.jsx"));
const EventRegistrations = lazy(() => import("./components/Events/Registrations.jsx"));

// Feedback module
const FeedbackDashboard = lazy(() => import("./components/FeedbackManagement/FeedbackDashboard.jsx"));
const FeedbackList = lazy(() => import("./components/FeedbackManagement/FeedbackList.jsx"));
const FeedbackForm = lazy(() => import("./components/FeedbackManagement/FeedbackForm.jsx"));
const FeedbackDetail = lazy(() => import("./components/FeedbackManagement/FeedbackDetail.jsx"));
const FeedbackSettings = lazy(() => import("./components/FeedbackManagement/FeedbackSettings.jsx"));


// Private Route Wrapper with Token Refresh
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useDjangoAuth();
  
  // Set up automatic token refresh for authenticated users
  useTokenRefresh(5); // Refresh every 5 minutes

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="bg-white p-8 shadow-lg rounded-md text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only redirect to login if we're sure the user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DjangoAuthProvider>
          <OfflineIndicator />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={
              <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
                <Login />
              </Suspense>
            } />
            <Route path="/login" element={
              <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
                <Login />
              </Suspense>
            } />
            <Route path="/logout" element={
              <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
                <Logout />
              </Suspense>
            } />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
                      <AdminNavbar />
                      <div className="transition-all duration-300 lg:ml-72 pt-16 lg:pt-0">
                        <div className="p-4 lg:p-6">
                          <Routes>
                            <Route path="/dashboard" element={<AdminDashboard />} />
                            <Route path="/home" element={<Students />} />
                            <Route path="/student-management" element={<StudentManagement />} />
                            <Route path="/student-registration" element={<StudentRegistration />} />
                            <Route path="/form-customizer" element={<FormCustomizer />} />
                            <Route path="/faculty" element={<FacultyManagement />} />
                            <Route path="/addfaculty" element={<AddFaculty />} />
                            
                            <Route path="/relationships" element={<Relationships />} />
                            <Route path="/facultyassignments" element={<FacultyAssignments />} />
                            <Route path="/faculty/:deptKey/members/:memberId" element={<FacultyViewer />} />
                            <Route path="/nodues" element={<NoDues />} />
                            <Route path="/noduesmanagement" element={<NoDuesManagement />} />
                            {/* Timetable routes removed */}
                            
                            <Route path="/attendance/*" element={<AttendanceModule />} />
                            <Route path="/coordinator" element={<CoordinatorAssignment />} />
                            {/* Mentoring routes */}
                            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
                            <Route path="/mentor/mentorships/:id" element={<MentorshipDetail />} />
                            <Route path="/hod/mentoring/analytics" element={<HodMentoringAnalytics />} />
                            <Route path="/admin/mentoring/auto-assign" element={<AccessGuard requirePermission="admin_access"><AdminMentoringAutoAssign /></AccessGuard>} />
                            <Route path="/make-admin" element={<AccessGuard requirePermission="admin_access"><MakeAdmin /></AccessGuard>} />
                            <Route path="/list-users" element={<UserList />} />
                            <Route path="/noduecurd" element={<NoduesCURD />} />
                            {/* Transport Management */}
                            <Route path="/transport" element={<TransportManagement />} />
                            <Route path="/transport/vehicles" element={<VehiclesPage />} />
                            <Route path="/transport/drivers" element={<DriversPage />} />
                            <Route path="/transport/stops" element={<StopsPage />} />
                            <Route path="/transport/routes" element={<RoutesPage />} />
                            <Route path="/transport/routes/detail/:id" element={<RouteDetailPage />} />
                            <Route path="/transport/assignments" element={<AssignmentsPage />} />
                            <Route path="/transport/schedules" element={<SchedulesPage />} />
                            <Route path="/transport/passes" element={<PassesPage />} />
                            <Route path="/hostel-management/*" element={<HostelManagement />} />
                            
                            <Route path="/grades-management" element={<GradesManagement />} />
                            <Route path="/fees-management/*" element={<FeesManagement />} />
                            <Route path="/research-development/*" element={<ResearchDevelopment />} />
                            {/* Feedback Management */}
                            <Route path="/feedback" element={<AccessGuard requirePermission="admin_access"><FeedbackDashboard /></AccessGuard>} />
                            <Route path="/feedback/list" element={<AccessGuard requirePermission="admin_access"><FeedbackList /></AccessGuard>} />
                            <Route path="/feedback/create" element={<AccessGuard requirePermission="admin_access"><FeedbackForm mode="create" /></AccessGuard>} />
                            <Route path="/feedback/:id" element={<AccessGuard requirePermission="admin_access"><FeedbackDetail /></AccessGuard>} />
                            <Route path="/feedback/:id/edit" element={<AccessGuard requirePermission="admin_access"><FeedbackForm mode="edit" /></AccessGuard>} />
                            <Route path="/feedback/settings" element={<AccessGuard requirePermission="admin_access"><FeedbackSettings /></AccessGuard>} />
                            <Route path="/placements-management" element={<PlacementsManagement />} />
                            <Route path="/profile" element={<UserProfile />} />
                            
                            <Route path="/superuser/students" element={<AccessGuard requireRole="admin"><SuperuserStudentList /></AccessGuard>} />
                            <Route path="/department-management" element={<DepartmentManagement />} />
                            <Route path="/department-management/resources" element={<DepartmentResources />} />
                            <Route path="/department-management/announcements" element={<DepartmentAnnouncements />} />
                            <Route path="/department-management/events" element={<DepartmentEvents />} />
                            <Route path="/department-management/documents" element={<DepartmentDocuments />} />
                            <Route path="/department-management/analytics" element={<DepartmentStats />} />
                            <Route path="/department-management/api-test" element={<DepartmentApiTest />} />
                            <Route path="/academic-management" element={<AcademicManagementDashboard />} />
                            <Route path="/academic-management/courses" element={<CoursesManagement />} />
                            <Route path="/academic-management/syllabi" element={<SyllabiManagement />} />
                            <Route path="/academic-management/syllabus-topics" element={<SyllabusTopicsManagement />} />
                            <Route path="/academic-management/course-sections" element={<CourseSectionsManagement />} />
                            <Route path="/academic-management/timetables" element={<TimetablesManagement />} />
                            <Route path="/academic-management/enrollments" element={<EnrollmentsManagement />} />
                            <Route path="/academic-management/batch-enrollments" element={<BatchEnrollmentsManagement />} />
                            <Route path="/academic-management/academic-calendar" element={<AcademicCalendarManagement />} />
                            <Route path="/academic-management/analytics" element={<AcademicAnalytics />} />
                            <Route path="/assignments" element={<AssignmentsOnePage />} />
                            <Route path="/assignments-management" element={<AssignmentsManagement />} />
                            <Route path="/assignments-management/categories" element={<AssignmentCategories />} />
                            <Route path="/assignments-management/templates" element={<AssignmentTemplates />} />
                            <Route path="/assignments-management/assignments" element={<AssignmentsCRUD />} />
                            <Route path="/assignments-management/submissions" element={<AssignmentSubmissions />} />
                            <Route path="/assignments-management/grading" element={<AssignmentGrading />} />
                            <Route path="/assignments-management/statistics" element={<AssignmentStatistics />} />

                            {/* Events Administration */}
                            <Route path="/admin/events" element={<EventsList />} />
                            <Route path="/admin/events/new" element={<EventForm mode="create" />} />
                            <Route path="/admin/events/:id" element={<EventDetail />} />
                            <Route path="/admin/events/:id/edit" element={<EventForm mode="edit" />} />
                            <Route path="/admin/events/:id/registrations" element={<EventRegistrations />} />
                            <Route path="/admin/events/venues" element={<Venues />} />
                            <Route path="/admin/events/categories" element={<Categories />} />

                            {/* Exams Administration */}
                            <Route path="/exams/dashboard" element={<ExamsDashboard />} />
                            <Route path="/exams/sessions" element={<ExamSessionsPage />} />
                            <Route path="/exams/schedules" element={<ExamSchedulesPage />} />
                            <Route path="/exams/registrations" element={<ExamRegistrationsPage />} />
                            <Route path="/exams/rooms" element={<ExamRoomsPage />} />
                            <Route path="/exams/staff" element={<ExamStaffPage />} />
                            <Route path="/exams/hall-tickets" element={<HallTicketsPage />} />
                            <Route path="/exams/attendance" element={<ExamAttendancePage />} />
                            <Route path="/exams/violations" element={<ExamViolationsPage />} />
                            <Route path="/exams/results" element={<ExamResultsPage />} />

                          </Routes>
                        </div>
                      </div>
                    </div>
                  </Suspense>
                </PrivateRoute>
              }
            />
          </Routes>
          </Router>
        </DjangoAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;


