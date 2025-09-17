import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import TokenStatus from "./TokenStatus";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaTasks,
  FaPlus,
  FaUsersCog,
  FaCalendarAlt,
  FaClipboardList,
  FaUserPlus,
  FaChalkboard,
  FaUserTie,
  FaUsers,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaChartBar,
  FaCreditCard,
  FaReceipt,
  FaCalculator,
  FaAward,
  FaBus,
  FaGraduationCap,
  FaFileAlt,
  FaCheckCircle,
  FaComments,
  FaHotel,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaChartLine,
  FaBriefcase,
  FaFlask,
  FaCommentDots,
  FaMapMarkerAlt,
  FaRoute,
  FaClock,
  FaIdBadge,
} from "react-icons/fa";

const AdminNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const location = useLocation();

  // Open by default on desktop, closed on mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setIsSidebarOpen(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    if (mediaQuery.matches) {
      document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (dropdownTitle) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownTitle]: !prev[dropdownTitle]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Config-driven sections
  const NAV_SECTIONS = useMemo(() => ([
    {
      title: "Transport",
      icon: FaBus,
      links: [
        { label: "Vehicles", to: "/transport/vehicles", icon: FaBus },
        { label: "Drivers", to: "/transport/drivers", icon: FaUserTie },
        { label: "Stops", to: "/transport/stops", icon: FaMapMarkerAlt },
        { label: "Routes", to: "/transport/routes", icon: FaRoute },
        { label: "Assignments", to: "/transport/assignments", icon: FaTasks },
        { label: "Schedules", to: "/transport/schedules", icon: FaClock },
        { label: "Passes", to: "/transport/passes", icon: FaIdBadge },
      ],
    },
    {
      title: "Students",
      icon: FaUserGraduate,
      to: "/student-management",
      links: [],
    },
    {
      title: "Faculty",
      icon: FaChalkboardTeacher,
      links: [
        { label: "Manage Faculty", to: "/faculty", icon: FaChalkboardTeacher },
        { label: "Add Faculty", to: "/addfaculty", icon: FaPlus },
      ],
    },
    
    
    {
      title: "Assign",
      icon: FaTasks,
      links: [
        { label: "Faculty Assigned", to: "/facultyassignments", icon: FaTasks },
        { label: "Course Assign", to: "/relationships", icon: FaUserTie },
        { label: "Coordinator Assignment", to: "/coordinator", icon: FaChalkboard },
      ],
    },
    {
      title: "No Dues",
      icon: FaClipboardList,
      links: [
        { label: "No Dues", to: "/nodues", icon: FaClipboardList },
        { label: "Manage Dues", to: "/noduesmanagement", icon: FaUsersCog },
      ],
    },
    {
      title: "Mentoring",
      icon: FaUsers,
      links: [
        { label: "Mentor Dashboard", to: "/mentor/dashboard", icon: FaUsers },
        { label: "HOD Analytics", to: "/hod/mentoring/analytics", icon: FaUsers },
        { label: "Admin Auto-Assign", to: "/admin/mentoring/auto-assign", icon: FaUsers },
      ],
    },
    
    
    {
      title: "Hostel",
      icon: FaHotel,
      to: "/hostel-management",
      links: [],
    },
    
    {
      title: "Grades Management",
      icon: FaChartLine,
      to: "/grades-management",
      links: [],
    },
    {
      title: "Research & Development",
      icon: FaFlask,
      to: "/research-development",
      links: [],
    },
    {
      title: "Feedback",
      icon: FaCommentDots,
      links: [
        { label: "Dashboard", to: "/feedback", icon: FaComments },
        { label: "List", to: "/feedback/list", icon: FaClipboardList },
        { label: "Create", to: "/feedback/create", icon: FaPlus },
        { label: "Settings", to: "/feedback/settings", icon: FaUsersCog },
      ],
    },
  ]), []);

  // Auto-open the section containing the active route (for dropdown sections only)
  useEffect(() => {
    const nextState = {};
    NAV_SECTIONS.forEach(section => {
      if (section.links && section.links.length > 0) {
        const isActiveInSection = section.links.some(l => l.to === location.pathname);
        nextState[section.title] = isActiveInSection;
      }
    });
    setOpenDropdowns(prev => ({ ...prev, ...nextState }));
  }, [location.pathname, NAV_SECTIONS]);

  const otherLinks = [];

  const SectionButton = ({ title, Icon, active, open, onClick, showLabel }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg mx-2 transition-colors duration-200 hover:shadow-md ${
        active ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <div className="flex items-center">
        <span className="text-lg"><Icon /></span>
        {showLabel && <span className="ml-3 font-medium">{title}</span>}
      </div>
      {showLabel && (
        <span className="text-sm">{open ? <FaChevronDown /> : <FaChevronRight />}</span>
      )}
    </button>
  );

  const NavLinkItem = ({ to, Icon, label, active, showLabel }) => (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm rounded-lg mx-2 transition-colors duration-200 hover:shadow-sm ${
        active ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="text-sm"><Icon /></span>
      {showLabel && <span className="ml-3">{label}</span>}
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white z-50 transition-transform duration-300 ease-in-out shadow-xl w-64 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:sticky lg:top-0 lg:self-start lg:h-screen lg:translate-x-0 ${isSidebarOpen ? 'lg:w-64' : 'lg:w-16'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          {isSidebarOpen && (
            <Link to="/dashboard" className="text-xl font-bold text-orange-400 hover:text-orange-300 transition-colors">
              CampusHub360
            </Link>
          )}
          <div className="flex items-center space-x-2">
            {!isSidebarOpen && (
              <>
                <TokenStatus 
                  showDetails={false}
                  className="text-xs"
                />
                <LogoutButton 
                  iconOnly={true}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                />
              </>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="flex-1 py-3">
            {NAV_SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              const isDirect = !!section.to;
              const sectionActive = isDirect
                ? isActive(section.to)
                : section.links.some(l => isActive(l.to));
              const isOpen = !!openDropdowns[section.title];

              return (
                <div key={section.title} className="mb-2">
                  {isDirect ? (
                    <Link
                      to={section.to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg mx-2 transition-colors duration-200 ${
                        sectionActive ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg"><SectionIcon /></span>
                        {isSidebarOpen && <span className="ml-3 font-medium">{section.title}</span>}
                      </div>
                    </Link>
                  ) : (
                    <>
                      <SectionButton
                        title={section.title}
                        Icon={SectionIcon}
                        active={sectionActive}
                        open={isOpen}
                        onClick={() => toggleDropdown(section.title)}
                        showLabel={isSidebarOpen}
                      />
                      {isOpen && isSidebarOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                          {section.links.map(link => {
                            const LinkIcon = link.icon;
                            return (
                              <NavLinkItem
                                key={link.to}
                                to={link.to}
                                Icon={LinkIcon}
                                label={link.label}
                                active={isActive(link.to)}
                                showLabel={isSidebarOpen}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {otherLinks.length > 0 && otherLinks.map(link => {
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-3 py-2.5 mx-2 rounded-lg transition-colors duration-200 ${
                    isActive(link.to) ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg"><LinkIcon /></span>
                  {isSidebarOpen && <span className="ml-3 font-medium">{link.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-700 p-4">
            <LogoutButton 
              showLabel={isSidebarOpen}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden flex items-center space-x-2">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <FaBars className="text-lg" />
        </button>
        <LogoutButton 
          iconOnly={true}
          className="p-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
        />
      </div>
    </>
  );
};

export default AdminNavbar;


