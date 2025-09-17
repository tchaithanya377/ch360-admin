import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUpload,
  faDownload,
  faIdCard,
  faMoneyBillWave,
  faHome,
  faBus,
  faEnvelope,
  faPrint,
  faCog,
  faBell,
  faChartBar,
  faGraduationCap,
  faFileAlt,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      title: "Add New Student",
      description: "Register a new student",
      icon: faPlus,
      color: "bg-green-500 hover:bg-green-600",
      action: "add-student"
    },
    {
      title: "Bulk Import",
      description: "Import students from Excel",
      icon: faUpload,
      color: "bg-blue-500 hover:bg-blue-600",
      action: "bulk-import"
    },
    {
      title: "Generate ID Cards",
      description: "Create student ID cards",
      icon: faIdCard,
      color: "bg-purple-500 hover:bg-purple-600",
      action: "id-cards"
    },
    {
      title: "Fee Management",
      description: "Manage student fees",
      icon: faMoneyBillWave,
      color: "bg-yellow-500 hover:bg-yellow-600",
      action: "fees"
    },
    {
      title: "Grades Management",
      description: "Manage marks and grades",
      icon: faGraduationCap,
      color: "bg-emerald-500 hover:bg-emerald-600",
      action: "grades"
    },
    {
      title: "Hostel Allocation",
      description: "Assign hostel rooms",
      icon: faHome,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: "hostel"
    },
    {
      title: "Transport Routes",
      description: "Manage transport routes",
      icon: faBus,
      color: "bg-teal-500 hover:bg-teal-600",
      action: "transport"
    },
    {
      title: "Send Notifications",
      description: "Send bulk notifications",
      icon: faEnvelope,
      color: "bg-pink-500 hover:bg-pink-600",
      action: "notifications"
    },
    {
      title: "Generate Reports",
      description: "Create detailed reports",
      icon: faChartBar,
      color: "bg-orange-500 hover:bg-orange-600",
      action: "reports"
    },
    {
      title: "Student Analytics",
      description: "View student analytics",
      icon: faUsers,
      color: "bg-cyan-500 hover:bg-cyan-600",
      action: "analytics"
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: faCog,
      color: "bg-gray-500 hover:bg-gray-600",
      action: "settings"
    },
    {
      title: "Export Data",
      description: "Export student data",
      icon: faDownload,
      color: "bg-lime-500 hover:bg-lime-600",
      action: "export"
    }
  ];

  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Fallback actions if no callback provided
      switch (action) {
        case "add-student":
          window.location.href = "/student-registration";
          break;
        case "bulk-import":
          alert("Bulk import functionality coming soon!");
          break;
        case "id-cards":
          window.location.href = "/students?idcards";
          break;
        case "fees":
          window.location.href = "/students?fees";
          break;
        case "grades":
          window.location.href = "/students?grades";
          break;
        case "hostel":
          window.location.href = "/students?hostel";
          break;
        case "transport":
          window.location.href = "/students?transport";
          break;
        case "notifications":
          alert("Notification system coming soon!");
          break;
        case "reports":
          alert("Report generation coming soon!");
          break;
        case "analytics":
          alert("Analytics dashboard coming soon!");
          break;
        case "settings":
          alert("Settings panel coming soon!");
          break;
        case "export":
          alert("Export functionality coming soon!");
          break;
        default:
          console.log(`Action: ${action}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.action)}
            className={`${action.color} text-white p-4 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            <div className="text-center">
              <FontAwesomeIcon icon={action.icon} className="text-2xl mb-2" />
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
