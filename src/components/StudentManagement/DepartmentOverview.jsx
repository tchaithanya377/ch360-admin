import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUsers, faChartBar } from "@fortawesome/free-solid-svg-icons";

const DepartmentOverview = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FontAwesomeIcon icon={faBuilding} className="text-green-500 mr-2" />
          Department Overview
        </h3>
        <p className="text-gray-600">No department data available</p>
      </div>
    );
  }

  const totalStudents = Object.values(stats).reduce((sum, count) => sum + count, 0);
  const departments = Object.entries(stats).sort(([,a], [,b]) => b - a);

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FontAwesomeIcon icon={faBuilding} className="text-green-500 mr-2" />
        Department Overview
      </h3>
      
      <div className="space-y-4">
        {departments.map(([dept, count]) => {
          const percentage = ((count / totalStudents) * 100).toFixed(1);
          return (
            <div key={dept} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">{dept}</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{count}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">{percentage}% of total</span>
                <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-sm" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Students</span>
          <span className="text-lg font-bold text-green-600">{totalStudents}</span>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOverview;
