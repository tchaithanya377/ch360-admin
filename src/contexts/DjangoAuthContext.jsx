import React, { createContext, useContext, useState, useEffect } from 'react';
import djangoAuthService from '../utils/djangoAuthService';
import { 
  getDjangoCurrentUser, 
  getMyProfile, 
  updateMyProfile,
  getRolesPermissions,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents,
  searchStudents,
  getStudentsStats,
  // Comprehensive Student Management Functions
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  getStudentEnrollmentHistory,
  addEnrollmentRecord,
  getStudentCustomFields,
  updateStudentCustomFields,
  createStudentLogin,
  bulkCreateStudentsEnhanced,
  bulkUpdateStudents,
  bulkDeleteStudents,
  advancedSearchStudents,
  getStudentAnalytics,
  exportStudentsData,
  importStudentsData
} from '../utils/djangoAuthHelpers';

const DjangoAuthContext = createContext();

export const useDjangoAuth = () => {
  const context = useContext(DjangoAuthContext);
  if (!context) {
    throw new Error('useDjangoAuth must be used within a DjangoAuthProvider');
  }
  return context;
};

export const DjangoAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Initialize authentication state and hydrate capabilities
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (djangoAuthService.isAuthenticated()) {
          const profile = await getDjangoCurrentUser();
          if (!profile) {
            djangoAuthService.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            setRoles([]);
            setPermissions([]);
            return;
          }

          // Fetch effective roles/permissions (cached by backend)
          let rpRoles = [];
          let rpPerms = [];
          try {
            const rp = await getRolesPermissions();
            if (rp?.success) {
              rpRoles = Array.isArray(rp.roles) ? rp.roles : [];
              rpPerms = Array.isArray(rp.permissions) ? rp.permissions : [];
            }
          } catch {}

          // Some backends include groups/permissions directly in /me
          // Use groups as roles; support array of strings or array of objects with name
          const meRoles = Array.isArray(profile?.groups)
            ? profile.groups.map((g) => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
            : [];
          const mePerms = Array.isArray(profile?.permissions) ? profile.permissions : [];
          const mergedRoles = Array.from(new Set([...(meRoles || []), ...(rpRoles || [])]));
          const mergedPerms = Array.from(new Set([...(mePerms || []), ...(rpPerms || [])]));

          setUser({ ...profile, roles: mergedRoles, permissions: mergedPerms });
          setRoles(mergedRoles);
          setPermissions(mergedPerms);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setRoles([]);
          setPermissions([]);
        }
      } catch (error) {
        djangoAuthService.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
        setRoles([]);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await djangoAuthService.login(email, password);
      
      if (result.success) {
        // Hydrate from /me and roles-permissions after login
        const profile = await getDjangoCurrentUser();
        if (!profile) {
          return { success: false, error: 'Failed to load profile after login' };
        }
        let rpRoles = [];
        let rpPerms = [];
        try {
          const rp = await getRolesPermissions();
          if (rp?.success) {
            rpRoles = Array.isArray(rp.roles) ? rp.roles : [];
            rpPerms = Array.isArray(rp.permissions) ? rp.permissions : [];
          }
        } catch {}

        const meRoles = Array.isArray(profile?.groups)
          ? profile.groups.map((g) => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
          : [];
        const mePerms = Array.isArray(profile?.permissions) ? profile.permissions : [];
        const mergedRoles = Array.from(new Set([...(meRoles || []), ...(rpRoles || [])]));
        const mergedPerms = Array.from(new Set([...(mePerms || []), ...(rpPerms || [])]));

        const hydratedUser = { ...profile, roles: mergedRoles, permissions: mergedPerms };
        setUser(hydratedUser);
        setRoles(mergedRoles);
        setPermissions(mergedPerms);
        setIsAuthenticated(true);
        return { success: true, user: hydratedUser };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      
      // Call the Django auth service logout
      const logoutResult = await djangoAuthService.logout();
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      
      
      return {
        success: true,
        backendLogoutSuccess: logoutResult.backendLogoutSuccess,
        backendError: logoutResult.backendError,
        message: logoutResult.message
      };
    } catch (error) {
      console.error('Context: Logout error:', error);
      
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      return { 
        success: false, 
        error: error.message,
        message: 'Logout failed due to unexpected error'
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userData = await getDjangoCurrentUser();
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      return null;
    }
  };

  // Get user profile using /accounts/me/ endpoint
  const fetchMyProfile = async () => {
    try {
      const result = await getMyProfile();
      if (result.success) {
        return result.data;
      } else {
        console.error('Failed to fetch profile:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Fetch my profile error:', error);
      return null;
    }
  };

  // Update user profile using /accounts/me/ endpoint
  const updateProfile = async (profileData) => {
    try {
      const result = await updateMyProfile(profileData);
      if (result.success) {
        // Update local user state with new data
        setUser(result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshToken = async () => {
    try {
      
      const refreshed = await djangoAuthService.refreshAccessToken();
      
      if (refreshed) {
        
        return { success: true };
      } else {
        
        // Clear authentication state if refresh fails
        setUser(null);
        setIsAuthenticated(false);
        return { success: false, error: 'Token refresh failed' };
      }
    } catch (error) {
      console.error('Context: Token refresh error:', error);
      // Clear authentication state on error
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  const ensureValidToken = async () => {
    try {
      const isValid = await djangoAuthService.ensureValidToken();
      if (!isValid) {
        
        setUser(null);
        setIsAuthenticated(false);
      }
      return isValid;
    } catch (error) {
      console.error('Context: Token validation error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Comprehensive Students Management operations
  const studentsOperations = {
    // Basic CRUD operations
    getStudents: async (params = {}) => {
      try {
        return await getStudents(params);
      } catch (error) {
        console.error('Context: Get students error:', error);
        return { success: false, error: error.message };
      }
    },

    getStudentById: async (studentId) => {
      try {
        return await getStudentById(studentId);
      } catch (error) {
        console.error('Context: Get student by ID error:', error);
        return { success: false, error: error.message };
      }
    },

    createStudent: async (studentData) => {
      try {
        return await createStudent(studentData);
      } catch (error) {
        console.error('Context: Create student error:', error);
        return { success: false, error: error.message };
      }
    },

    updateStudent: async (studentId, studentData) => {
      try {
        return await updateStudent(studentId, studentData);
      } catch (error) {
        console.error('Context: Update student error:', error);
        return { success: false, error: error.message };
      }
    },

    deleteStudent: async (studentId) => {
      try {
        return await deleteStudent(studentId);
      } catch (error) {
        console.error('Context: Delete student error:', error);
        return { success: false, error: error.message };
      }
    },

    // Document Management
    getStudentDocuments: async (studentId) => {
      try {
        return await getStudentDocuments(studentId);
      } catch (error) {
        console.error('Context: Get student documents error:', error);
        return { success: false, error: error.message };
      }
    },

    uploadStudentDocument: async (studentId, documentData) => {
      try {
        return await uploadStudentDocument(studentId, documentData);
      } catch (error) {
        console.error('Context: Upload student document error:', error);
        return { success: false, error: error.message };
      }
    },

    deleteStudentDocument: async (studentId, documentId) => {
      try {
        return await deleteStudentDocument(studentId, documentId);
      } catch (error) {
        console.error('Context: Delete student document error:', error);
        return { success: false, error: error.message };
      }
    },

    // Enrollment History Management
    getStudentEnrollmentHistory: async (studentId) => {
      try {
        return await getStudentEnrollmentHistory(studentId);
      } catch (error) {
        console.error('Context: Get student enrollment history error:', error);
        return { success: false, error: error.message };
      }
    },

    addEnrollmentRecord: async (studentId, enrollmentData) => {
      try {
        return await addEnrollmentRecord(studentId, enrollmentData);
      } catch (error) {
        console.error('Context: Add enrollment record error:', error);
        return { success: false, error: error.message };
      }
    },

    // Custom Fields Management
    getStudentCustomFields: async (studentId) => {
      try {
        return await getStudentCustomFields(studentId);
      } catch (error) {
        console.error('Context: Get student custom fields error:', error);
        return { success: false, error: error.message };
      }
    },

    updateStudentCustomFields: async (studentId, customFields) => {
      try {
        return await updateStudentCustomFields(studentId, customFields);
      } catch (error) {
        console.error('Context: Update student custom fields error:', error);
        return { success: false, error: error.message };
      }
    },

    // Login Management
    createStudentLogin: async (studentId, loginData) => {
      try {
        return await createStudentLogin(studentId, loginData);
      } catch (error) {
        console.error('Context: Create student login error:', error);
        return { success: false, error: error.message };
      }
    },

    // Bulk Operations
    bulkCreateStudents: async (studentsData) => {
      try {
        return await bulkCreateStudents(studentsData);
      } catch (error) {
        console.error('Context: Bulk create students error:', error);
        return { success: false, error: error.message };
      }
    },

    bulkCreateStudentsEnhanced: async (studentsData) => {
      try {
        return await bulkCreateStudentsEnhanced(studentsData);
      } catch (error) {
        console.error('Context: Bulk create students enhanced error:', error);
        return { success: false, error: error.message };
      }
    },

    bulkUpdateStudents: async (updateData) => {
      try {
        return await bulkUpdateStudents(updateData);
      } catch (error) {
        console.error('Context: Bulk update students error:', error);
        return { success: false, error: error.message };
      }
    },

    bulkDeleteStudents: async (studentIds) => {
      try {
        return await bulkDeleteStudents(studentIds);
      } catch (error) {
        console.error('Context: Bulk delete students error:', error);
        return { success: false, error: error.message };
      }
    },

    // Search and Analytics
    searchStudents: async (searchParams = {}) => {
      try {
        return await searchStudents(searchParams);
      } catch (error) {
        console.error('Context: Search students error:', error);
        return { success: false, error: error.message };
      }
    },

    advancedSearchStudents: async (searchParams = {}) => {
      try {
        return await advancedSearchStudents(searchParams);
      } catch (error) {
        console.error('Context: Advanced search students error:', error);
        return { success: false, error: error.message };
      }
    },

    getStudentsStats: async () => {
      try {
        return await getStudentsStats();
      } catch (error) {
        console.error('Context: Get students stats error:', error);
        return { success: false, error: error.message };
      }
    },

    getStudentAnalytics: async (filters = {}) => {
      try {
        return await getStudentAnalytics(filters);
      } catch (error) {
        console.error('Context: Get student analytics error:', error);
        return { success: false, error: error.message };
      }
    },

    // Data Import/Export
    exportStudentsData: async (filters = {}, format = 'csv') => {
      try {
        return await exportStudentsData(filters, format);
      } catch (error) {
        console.error('Context: Export students data error:', error);
        return { success: false, error: error.message };
      }
    },

    importStudentsData: async (fileData, options = {}) => {
      try {
        return await importStudentsData(fileData, options);
      } catch (error) {
        console.error('Context: Import students data error:', error);
        return { success: false, error: error.message };
      }
    }
  };

  const value = {
    user,
    roles,
    permissions,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
    refreshToken,
    ensureValidToken,
    fetchMyProfile,
    updateProfile,
    token: djangoAuthService.getToken(),
    hasRole: (role) => Array.isArray(user?.roles) && user.roles.includes(role),
    hasPermission: (perm) => Array.isArray(user?.permissions) && user.permissions.includes(perm),
    // Students CRUD operations
    students: studentsOperations,
  };

  return (
    <DjangoAuthContext.Provider value={value}>
      {children}
    </DjangoAuthContext.Provider>
  );
};
