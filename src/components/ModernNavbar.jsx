import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ModernNavbar.css";
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
  FaBuilding,
  FaCogs,
  FaBullhorn,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaChartLine,
  FaBriefcase,
  FaFlask,
  FaCommentDots,
  FaSun,
  FaMoon,
  FaDatabase,
  FaHandshake,
  FaUserCheck,
  FaClipboardCheck,
  FaTrophy,
  FaMapMarkerAlt,
  FaRoute,
  FaClock,
  FaIdBadge,
  FaTicketAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const ModernNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownDirection, setDropdownDirection] = useState('down'); // 'up' or 'down'
  const [dropdownSide, setDropdownSide] = useState('right'); // 'left' or 'right'
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which dropdown is active
  const [isDropdownHovered, setIsDropdownHovered] = useState(false); // Track if dropdown is being hovered
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

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialTheme);
    
    // Apply initial theme
    if (initialTheme) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (dropdownTitle, event) => {
    // If clicking the same dropdown, close it
    if (openDropdowns[dropdownTitle]) {
      setOpenDropdowns(prev => ({
        ...prev,
        [dropdownTitle]: false
      }));
      setActiveDropdown(null);
      return;
    }

    // Close all other dropdowns first
    setOpenDropdowns({ [dropdownTitle]: true });
    setActiveDropdown(dropdownTitle);

    // Calculate position for the new dropdown
    if (event) {
      const targetElement = event.currentTarget;
      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Calculate actual dropdown height based on number of items
      const navItem = NAV_SECTIONS.flatMap(section => section.items).find(item => item.title === dropdownTitle);
      const numberOfItems = navItem ? navItem.links.length : 0;
      const itemHeight = 48; // Approximate height per dropdown item
      const dropdownPadding = 24; // Padding top + bottom
      const actualDropdownHeight = Math.min(numberOfItems * itemHeight + dropdownPadding, 400); // Max height 400px
      const dropdownWidth = 220; // Approximate width of dropdown card
      const spacing = 8;
      
      // Calculate available space in all directions
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = windowWidth - rect.right;
      const spaceLeft = rect.left;
      
      // Check if dropdown would go below viewport
      const wouldGoBelowViewport = rect.bottom + actualDropdownHeight + spacing > windowHeight;
      const wouldGoAboveViewport = rect.top - actualDropdownHeight - spacing < 0;
      
      // Check if this is a bottom item (near bottom of viewport)
      const isBottomItem = rect.bottom > windowHeight * 0.7; // If item is in bottom 30% of viewport
      const isTopItem = rect.top < windowHeight * 0.3; // If item is in top 30% of viewport
      
      // Determine vertical position - align with the nav item
      let top;
      let direction = 'down';
      
      if (isBottomItem || wouldGoBelowViewport) {
        // Bottom item or would overflow - shrink upward
        top = rect.bottom - actualDropdownHeight;
        direction = 'up';
      } else if (isTopItem || wouldGoAboveViewport) {
        // Top item or would overflow - shrink downward
        top = rect.top;
        direction = 'down';
      } else if (spaceBelow >= actualDropdownHeight + spacing) {
        // Enough space below - align with item top
        top = rect.top;
        direction = 'down';
      } else if (spaceAbove >= actualDropdownHeight + spacing) {
        // Not enough space below, but enough above - position above item
        top = rect.bottom - actualDropdownHeight;
        direction = 'up';
      } else {
        // Not enough space in either direction - use available space
        if (spaceBelow > spaceAbove) {
          top = rect.top;
          direction = 'down';
        } else {
          top = Math.max(spacing, rect.bottom - actualDropdownHeight);
          direction = 'up';
        }
      }
      
      // Ensure dropdown doesn't go outside viewport
      if (top < spacing) {
        top = spacing;
      }
      if (top + actualDropdownHeight > windowHeight - spacing) {
        top = windowHeight - actualDropdownHeight - spacing;
      }
      
      // Determine horizontal position - position relative to nav item
      let left;
      let side = 'right';
      
      if (spaceRight >= dropdownWidth + spacing) {
        // Enough space on the right - position to the right of the nav item
        left = rect.right + spacing;
        side = 'right';
      } else if (spaceLeft >= dropdownWidth + spacing) {
        // Not enough space on right, but enough on left - position to the left
        left = rect.left - dropdownWidth - spacing;
        side = 'left';
      } else {
        // Not enough space on either side - use available space
        if (spaceRight > spaceLeft) {
          left = rect.right + spacing;
          side = 'right';
        } else {
          left = Math.max(spacing, rect.left - dropdownWidth - spacing);
          side = 'left';
        }
      }
      
      // Ensure dropdown doesn't go outside viewport horizontally
      left = Math.max(spacing, Math.min(left, windowWidth - dropdownWidth - spacing));
      
      setDropdownPosition({ top, left });
      setDropdownDirection(direction);
      setDropdownSide(side);
    }
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
    setActiveDropdown(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Config-driven sections organized like the image
  const NAV_SECTIONS = useMemo(() => ([
    {
      sectionTitle: "MAIN NAVIGATION",
      items: [
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
          title: "Exams",
          icon: FaTrophy,
          links: [
            { label: "Dashboard", to: "/exams/dashboard", icon: FaTrophy },
            { label: "Sessions", to: "/exams/sessions", icon: FaCalendarAlt },
            { label: "Schedules", to: "/exams/schedules", icon: FaClock },
            { label: "Registrations", to: "/exams/registrations", icon: FaIdBadge },
            { label: "Rooms", to: "/exams/rooms", icon: FaBuilding },
            { label: "Staff", to: "/exams/staff", icon: FaUserTie },
            { label: "Hall Tickets", to: "/exams/hall-tickets", icon: FaTicketAlt },
            { label: "Attendance", to: "/exams/attendance", icon: FaClipboardCheck },
            { label: "Violations", to: "/exams/violations", icon: FaExclamationTriangle },
            { label: "Results", to: "/exams/results", icon: FaCheckCircle },
          ],
        },
        {
          title: "Home",
          icon: FaUserGraduate,
          to: "/home",
          links: [],
        },
        
        {
          title: "Students",
          icon: FaUserGraduate,
          to: "/student-management",
          links: [],
        },
      ]
    },
    {
      sectionTitle: "ACADEMIC",
      items: [
        {
          title: "Attendance",
          icon: FaClipboardList,
          to: "/attendance",
          links: [],
        },
        
        {
          title: "Grades",
          icon: FaChartLine,
          to: "/grades-management",
          links: [],
        },
        
        {
          title: "Academic Management",
          icon: FaGraduationCap,
          links: [
            { label: "Dashboard", to: "/academic-management", icon: FaGraduationCap },
            { label: "Courses", to: "/academic-management/courses", icon: FaBook },
            { label: "Enrollments", to: "/academic-management/enrollments", icon: FaUserGraduate },
            { label: "Batch Enrollments", to: "/academic-management/batch-enrollments", icon: FaUsers },
            { label: "Timetables", to: "/academic-management/timetables", icon: FaCalendarAlt },
            { label: "Academic Calendar", to: "/academic-management/academic-calendar", icon: FaCalendarAlt },
            { label: "Course Sections", to: "/academic-management/course-sections", icon: FaClipboardList },
            { label: "Syllabi", to: "/academic-management/syllabi", icon: FaFileAlt },
            { label: "Syllabus Topics", to: "/academic-management/syllabus-topics", icon: FaClipboardList },
            { label: "Analytics", to: "/academic-management/analytics", icon: FaChartBar },
          ],
        },
      ]
    },
    {
      sectionTitle: "WORKFLOW",
      items: [
        {
          title: "Placements",
          icon: FaBriefcase,
          to: "/placements-management",
          links: [],
        },
        {
          title: "Events",
          icon: FaCalendarAlt,
          links: [
            { label: "Events", to: "/admin/events", icon: FaCalendarAlt },
            { label: "Venues", to: "/admin/events/venues", icon: FaBuilding },
            { label: "Categories", to: "/admin/events/categories", icon: FaClipboardList },
          ],
        },
        {
          title: "Approval Workflow",
          icon: FaCheckCircle,
          to: "/approval-workflow",
          links: [],
        },
        
        {
          title: "Request",
          icon: FaFileAlt,
          links: [
            { label: "Pending Requests", to: "/requests", icon: FaFileAlt },
            { label: "Request History", to: "/request-history", icon: FaClipboardList },
          ],
        },
        {
          title: "Faculty Management",
          icon: FaChalkboardTeacher,
          links: [
            { label: "Manage Faculty", to: "/faculty", icon: FaChalkboardTeacher },
            { label: "Add Faculty", to: "/addfaculty", icon: FaPlus },
          ],
        },
        {
          title: "Department Management",
          icon: FaBuilding,
          links: [
            { label: "Overview", to: "/department-management", icon: FaBuilding },
            { label: "Resources", to: "/department-management/resources", icon: FaCogs },
            { label: "Announcements", to: "/department-management/announcements", icon: FaBullhorn },
            { label: "Events", to: "/department-management/events", icon: FaCalendarAlt },
            { label: "Documents", to: "/department-management/documents", icon: FaFileAlt },
            { label: "Analytics", to: "/department-management/analytics", icon: FaChartBar },
            { label: "API Test", to: "/department-management/api-test", icon: FaFlask },
          ],
        },
        {
          title: "Assignments",
          icon: FaTasks,
          links: [
            { label: "Assignments", to: "/assignments", icon: FaTasks },
            { label: "Faculty Assigned", to: "/facultyassignments", icon: FaTasks },
            { label: "Course Assign", to: "/relationships", icon: FaUserTie },
            { label: "Coordinator Assignment", to: "/coordinator", icon: FaChalkboard },
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
        
      ]
    },
    {
      sectionTitle: "ACCOUNT",
      items: [
        
        {
          title: "No Dues",
          icon: FaClipboardList,
          links: [
            { label: "No Dues", to: "/nodues", icon: FaClipboardList },
            { label: "Manage Dues", to: "/noduesmanagement", icon: FaUsersCog },
          ],
        },
        {
          title: "Fees",
          icon: FaMoneyBillWave,
          to: "/fees-management",
          links: [],
        },
        
        {
          title: "Hostel",
          icon: FaHotel,
          to: "/hostel-management",
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
        {
          title: "User Profile",
          icon: FaUserTie,
          to: "/profile",
          links: [],
        },
      ]
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdownClick = event.target.closest('.dropdown-card');
      const isNavItemClick = event.target.closest('.nav-link');
      
      if (!isDropdownClick && !isNavItemClick) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset dropdown hover state when no dropdowns are open
  useEffect(() => {
    const hasOpenDropdowns = Object.values(openDropdowns).some(isOpen => isOpen);
    if (!hasOpenDropdowns) {
      setIsDropdownHovered(false);
    }
  }, [openDropdowns]);

  const otherLinks = [];

  const SectionButton = ({ title, Icon, active, open, onClick, showLabel }) => (
    <button
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`nav-link ${active ? 'active' : ''}`}
      aria-expanded={open}
      aria-haspopup="true"
    >
      <Icon className="nav-link-icon" />
      {showLabel && <span className="nav-link-text">{title}</span>}
      {showLabel && (
        <span className="ml-auto">
          <FaChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      )}
    </button>
  );

  const NavLinkItem = ({ to, Icon, label, active, showLabel }) => (
    <Link
      to={to}
      className={`nav-link ${active ? 'active' : ''}`}
    >
      <Icon className="nav-link-icon" />
      {showLabel && <span className="nav-link-text">{label}</span>}
    </Link>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header lg:hidden">
        <div className="mobile-logo">
          <div className="mobile-logo-icon">
            <FaUserGraduate />
          </div>
          <div>
            <div className="mobile-title">CampusHub360</div>
            <div className="mobile-subtitle">Admin Panel</div>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="mobile-menu-toggle"
        >
          <FaBars className="mobile-menu-icon" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="nav-backdrop lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`nav-container ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Header */}
        <div className="nav-header">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <FaUserGraduate />
            </div>
            <div className="nav-title-container">
              <div className="nav-app-title">CampusHub360</div>
              <div className="nav-app-subtitle">
                <span className="nav-subtitle-text">Admin Panel</span>
                <div className="nav-status-indicator"></div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="nav-theme-toggle"
          >
            {isDarkMode ? <FaSun className="nav-theme-icon" /> : <FaMoon className="nav-theme-icon" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="nav-links-container">
          {NAV_SECTIONS.map((section) => (
            <div key={section.sectionTitle} className="nav-section">
              {/* Section Header */}
              <div className="nav-section-header">{section.sectionTitle}</div>
              
              {/* Section Items */}
              <div className="nav-links">
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isDirect = !!item.to;
                  const itemActive = isDirect
                    ? isActive(item.to)
                    : item.links.some(l => isActive(l.to));
                  const isOpen = !!openDropdowns[item.title];

                  return (
                    <div key={item.title}>
                      {isDirect ? (
                        <Link
                          to={item.to}
                          className={`nav-link ${itemActive ? 'active' : ''}`}
                        >
                          <ItemIcon className="nav-link-icon" />
                          <span className="nav-link-text">{item.title}</span>
                        </Link>
                                             ) : (
                         <div className="relative">
                                                        <SectionButton
                               title={item.title}
                               Icon={ItemIcon}
                               active={itemActive}
                               open={isOpen}
                                                               onClick={(e) => toggleDropdown(item.title, e)}
                               showLabel={true}
                             />
                           {isOpen && (
                             <div 
                               className={`dropdown-card ${dropdownDirection === 'up' ? 'shrink-up' : 'shrink-down'} position-${dropdownSide}`}
                               style={{
                                 top: `${dropdownPosition.top}px`,
                                 left: `${dropdownPosition.left}px`
                               }}
                               role="menu"
                               aria-label={`${item.title} menu`}
                             >
                               {item.links
                                .slice()
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map(link => {
                                const LinkIcon = link.icon;
                                return (
                                  <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`dropdown-card-item ${isActive(link.to) ? 'active' : ''}`}
                                  >
                                    <LinkIcon className="dropdown-item-icon" />
                                    <span className="dropdown-item-text">{link.label}</span>
                                  </Link>
                                );
                              })}
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Other Links Section */}
          {otherLinks.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-header">Utilities</div>
              <div className="nav-links">
                {otherLinks.map(link => {
                  const LinkIcon = link.icon;
                  return (
                    <NavLinkItem
                      key={link.to}
                      to={link.to}
                      Icon={LinkIcon}
                      label={link.label}
                      active={isActive(link.to)}
                      showLabel={true}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="nav-header border-t mt-auto">
          <Link
            to="/profile"
            className="nav-link text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-200"
          >
            <FaUserTie className="nav-link-icon" />
            <span className="nav-link-text">My Profile</span>
          </Link>
          <Link
            to="/logout"
            className="nav-link text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <FaSignOutAlt className="nav-link-icon" />
            <span className="nav-link-text">Logout</span>
          </Link>
        </div>
      </div>

      {/* Mobile Toggle Button - Only show when mobile header is not visible */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        style={{ display: 'none' }} // Hide this since we have the mobile header
      >
        <FaBars className="text-lg" />
      </button>
    </>
  );
};

export default ModernNavbar;
