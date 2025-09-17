import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCheckCircle,
  faExclamationTriangle,
  faGraduationCap,
  faMoneyBillWave,
  faClock,
  faHome,
  faBus,
  faBuilding,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";

const StudentStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Students",
      value: stats.total,
      icon: faUsers,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800"
    },
    {
      title: "Active Students",
      value: stats.active,
      icon: faCheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800"
    },
    {
      title: "Inactive Students",
      value: stats.inactive,
      icon: faExclamationTriangle,
      color: "yellow",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800"
    },
    {
      title: "Graduated",
      value: stats.graduated,
      icon: faGraduationCap,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800"
    },
    {
      title: "Fee Paid",
      value: stats.feeStatus?.paid || 0,
      icon: faMoneyBillWave,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800"
    },
    {
      title: "Fee Pending",
      value: stats.feeStatus?.pending || 0,
      icon: faClock,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800"
    },
    {
      title: "Hostel Required",
      value: stats.byHostel?.Required || 0,
      icon: faHome,
      color: "indigo",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-800"
    },
    {
      title: "Transport Required",
      value: stats.byTransport?.Required || 0,
      icon: faBus,
      color: "teal",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      textColor: "text-teal-800"
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
      purple: "text-purple-500",
      orange: "text-orange-500",
      indigo: "text-indigo-500",
      teal: "text-teal-500"
    };
    return colors[color] || "text-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.slice(0, 4).map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-white shadow-sm`}>
                <FontAwesomeIcon icon={stat.icon} className={`text-xl ${getIconColor(stat.color)}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.slice(4).map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-lg sm:text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full bg-white shadow-sm`}>
                <FontAwesomeIcon icon={stat.icon} className={`text-lg ${getIconColor(stat.color)}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Year-wise Distribution */}
      {stats.byYear && Object.keys(stats.byYear).length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-500 mr-2" />
            Year-wise Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(stats.byYear).map(([year, count]) => (
              <div key={year} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{year} Year</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department-wise Distribution */}
      {stats.byDepartment && Object.keys(stats.byDepartment).length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="text-green-500 mr-2" />
            Department-wise Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(stats.byDepartment).map(([dept, count]) => (
              <div key={dept} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{dept}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{count} students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-green-600">{count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStats;
