import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUserEdit,
  faUserGraduate,
  faMoneyBillWave,
  faClock,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      type: "registration",
      title: "New Student Registration",
      description: "John Doe registered for Computer Science",
      time: "2 minutes ago",
      icon: faUserPlus,
      color: "text-green-500"
    },
    {
      id: 2,
      type: "update",
      title: "Student Information Updated",
      description: "Sarah Wilson's contact details updated",
      time: "15 minutes ago",
      icon: faUserEdit,
      color: "text-blue-500"
    },
    {
      id: 3,
      type: "fee",
      title: "Fee Payment Received",
      description: "Michael Brown paid semester fees",
      time: "1 hour ago",
      icon: faMoneyBillWave,
      color: "text-green-500"
    },
    {
      id: 4,
      type: "graduation",
      title: "Student Graduated",
      description: "Emily Davis completed final semester",
      time: "2 hours ago",
      icon: faUserGraduate,
      color: "text-purple-500"
    },
    {
      id: 5,
      type: "pending",
      title: "Fee Payment Pending",
      description: "Alex Johnson's fees due in 3 days",
      time: "3 hours ago",
      icon: faClock,
      color: "text-orange-500"
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "registration":
        return faUserPlus;
      case "update":
        return faUserEdit;
      case "fee":
        return faMoneyBillWave;
      case "graduation":
        return faUserGraduate;
      case "pending":
        return faClock;
      default:
        return faCheckCircle;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "registration":
      case "fee":
        return "text-green-500";
      case "update":
        return "text-blue-500";
      case "graduation":
        return "text-purple-500";
      case "pending":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                <FontAwesomeIcon icon={getActivityIcon(activity.type)} className="text-sm" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{activity.title}</h4>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
