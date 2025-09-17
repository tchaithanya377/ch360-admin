import React, { useEffect, useState } from "react";
import studentApiService from '../services/studentApiService';
import { motion } from "framer-motion";
import { 
  FaUsers, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaChartBar,
  FaUserGraduate,
  FaBookOpen,
  FaUserTie
} from "react-icons/fa";

const Dashboard = () => {
  const [studentsData, setStudentsData] = useState({});
  const [coursesData, setCoursesData] = useState({});
  const [facultyCount, setFacultyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch student statistics from Django API
        const statsData = await studentApiService.getStudentStats();
        
        // Update state with Django data
        setStudentsData(statsData.by_year || {});
        setCoursesData({}); // TODO: Implement courses API
        setFacultyCount(0); // TODO: Implement faculty API
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values on error
        setStudentsData({});
        setCoursesData({});
        setFacultyCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const totalStudents = Object.values(studentsData).flatMap((sec) =>
    Object.values(sec)
  ).reduce((a, b) => a + b, 0);

  const totalCourses = Object.values(coursesData).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Campus Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of academic statistics and institutional data
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="ml-4 text-lg text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, staggerChildren: 0.2 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300"
                variants={cardVariants}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <FaUsers className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300"
                variants={cardVariants}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Courses
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {totalCourses}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <FaBookOpen className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300"
                variants={cardVariants}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Faculty
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {facultyCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <FaChalkboardTeacher className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Detailed Information */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, staggerChildren: 0.2 }}
            >
              {/* Students per Section */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700"
                variants={cardVariants}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <FaUserGraduate className="text-2xl text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Students Per Section
                  </h3>
                </div>
                <div className="space-y-4">
                  {Object.keys(studentsData).map((year) => (
                    <div key={year} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                        {year} Year
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(studentsData[year]).map(
                          ([section, count]) => (
                            <div key={section} className="text-center">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Section {section}
                              </p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {count}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Courses per Year */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700"
                variants={cardVariants}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <FaChartBar className="text-2xl text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Courses Per Year
                  </h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(coursesData).map(([year, count]) => (
                    <div key={year} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FaBookOpen className="text-lg text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {year} Year
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {count}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Courses
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Additional Stats */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700"
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div className="flex items-center space-x-3 mb-6">
                <FaUserTie className="text-2xl text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalStudents}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enrolled Students
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalCourses}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Courses
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {facultyCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Faculty Members
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Object.keys(studentsData).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Academic Years
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;