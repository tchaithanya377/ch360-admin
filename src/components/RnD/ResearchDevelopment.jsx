import React, { Suspense, lazy, useState } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";

const Projects = lazy(() => import("./projects/Projects.jsx"));
const Grants = lazy(() => import("./grants/Grants.jsx"));
const Publications = lazy(() => import("./publications/Publications.jsx"));
const PublicationsDetail = lazy(() => import("./publications/PublicationsDetail.jsx"));
const PaidJournals = lazy(() => import("./publications/PaidJournals.jsx"));
const StudentPublications = lazy(() => import("./publications/StudentPublications.jsx"));
const UGCPublications = lazy(() => import("./publications/UGCPublications.jsx"));
const Patents = lazy(() => import("./patents/Patents.jsx"));
const Collaborations = lazy(() => import("./collaborations/Collaborations.jsx"));
const Students = lazy(() => import("./students/Students.jsx"));
const Conferences = lazy(() => import("./conferences/Conferences.jsx"));
const Analytics = lazy(() => import("./analytics/Analytics.jsx"));
const Integrations = lazy(() => import("./integrations/Integrations.jsx"));
const FacultyOutputs = lazy(() => import("./faculty/FacultyOutputs.jsx"));

const TabLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
        isActive 
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-blue-600" 
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
      }`}
    >
      {label}
    </Link>
  );
};

const ResearchDevelopment = () => {
  const base = "/research-development";
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Research & Development</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Manage research projects, publications, grants, and academic collaborations to drive innovation and academic excellence.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex gap-3 flex-wrap justify-center">
              <TabLink to={`${base}/projects`} label="Projects" />
              <TabLink to={`${base}/grants`} label="Grants" />
              <TabLink to={`${base}/publications`} label="Publications" />
              <TabLink to={`${base}/publications-details`} label="Publication Details" />
              <TabLink to={`${base}/paid-journals`} label="Paid Journals" />
              <TabLink to={`${base}/student-publications`} label="Student Publications" />
              <TabLink to={`${base}/ugc-publications`} label="UGC Publications" />
              <TabLink to={`${base}/patents`} label="Patents" />
              <TabLink to={`${base}/collaborations`} label="Collaborations" />
              <TabLink to={`${base}/students`} label="Student Research" />
              <TabLink to={`${base}/conferences`} label="Conferences" />
              <TabLink to={`${base}/faculty-outputs`} label="Faculty Outputs" />
              <TabLink to={`${base}/analytics`} label="Analytics" />
              <TabLink to={`${base}/integrations`} label="Integrations" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading research tools...</p>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/projects/*" element={<Projects />} />
                  <Route path="/grants" element={<Grants />} />
                  <Route path="/publications" element={<Publications />} />
                  <Route path="/publications-details" element={<PublicationsDetail />} />
                  <Route path="/paid-journals" element={<PaidJournals />} />
                  <Route path="/student-publications" element={<StudentPublications />} />
                  <Route path="/ugc-publications" element={<UGCPublications />} />
                  <Route path="/patents" element={<Patents />} />
                  <Route path="/collaborations" element={<Collaborations />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/conferences" element={<Conferences />} />
                  <Route path="/faculty-outputs" element={<FacultyOutputs />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="*" element={<Navigate to={`${base}/projects`} replace />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchDevelopment;


