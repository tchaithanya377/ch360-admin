import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBus,
  faRoute,
  faUsers,
  faMapMarkerAlt,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faPlus,
  faEdit,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const TransportOverview = ({ stats, onTabChange }) => {
  const [selectedRoute, setSelectedRoute] = useState("all");
  const [transportRoutes, setTransportRoutes] = useState([]);
  const [recentAllocations, setRecentAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const transportData = {
    required: stats?.Required || 0,
    notRequired: stats?.["Not Required"] || 0
  };

  const totalStudents = transportData.required + transportData.notRequired;
  const utilizationRate = totalStudents > 0 ? ((transportData.required / totalStudents) * 100).toFixed(1) : 0;

  // Fetch transport routes from Firebase
  useEffect(() => {
    const unsubscribeRoutes = onSnapshot(
      query(collection(db, 'transportRoutes'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const routes = [];
        snapshot.forEach((doc) => {
          routes.push({ id: doc.id, ...doc.data() });
        });
        setTransportRoutes(routes);
      }
    );

    return () => unsubscribeRoutes();
  }, []);

  // Fetch recent allocations from Firebase
  useEffect(() => {
    const unsubscribeAllocations = onSnapshot(
      query(collection(db, 'transportAllocations'), orderBy('createdAt', 'desc'), limit(5)),
      (snapshot) => {
        const allocations = [];
        snapshot.forEach((doc) => {
          allocations.push({ id: doc.id, ...doc.data() });
        });
        setRecentAllocations(allocations);
        setLoading(false);
      }
    );

    return () => unsubscribeAllocations();
  }, []);

  // Navigation functions
  const navigateToTab = (tabName) => {
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  const handleViewRouteDetails = (routeId) => {
    navigateToTab('routes');
    // You can add additional logic to highlight the specific route
  };

  const handleAllocateRoute = (routeId) => {
    navigateToTab('allocations');
    // You can add additional logic to pre-select the route
  };

  const handleEditAllocation = (allocationId) => {
    navigateToTab('allocations');
    // You can add additional logic to edit the specific allocation
  };

  const handleDeleteAllocation = async (allocationId) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'transportAllocations', allocationId));
      } catch (error) {
        console.error('Error deleting allocation:', error);
        alert('Failed to delete allocation');
      }
    }
  };

  const handleNewAllocation = () => {
    navigateToTab('allocations');
  };

  const handleManageRoutes = () => {
    navigateToTab('routes');
  };

  const handleRouteRequests = () => {
    navigateToTab('allocations');
  };

  const handleSchedule = () => {
    navigateToTab('schedule');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transport Management</h2>
          <p className="text-gray-600">Manage student transportation and route allocations</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button 
            onClick={handleNewAllocation}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Allocate Route</span>
          </button>
          <button 
            onClick={handleManageRoutes}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faRoute} />
            <span>Manage Routes</span>
          </button>
        </div>
      </div>

      {/* Transport Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transport Required</p>
              <p className="text-3xl font-bold text-green-800">{transportData.required}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalStudents > 0 ? `${((transportData.required / totalStudents) * 100).toFixed(1)}%` : '0%'} of students
              </p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              <FontAwesomeIcon icon={faBus} className="text-2xl text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-3xl font-bold text-blue-800">{transportRoutes.length}</p>
              <p className="text-sm text-gray-500 mt-1">Active routes</p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              <FontAwesomeIcon icon={faRoute} className="text-2xl text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
              <p className="text-3xl font-bold text-purple-800">{utilizationRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Current utilization</p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              <FontAwesomeIcon icon={faUsers} className="text-2xl text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Route Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transport Routes Overview</h3>
        {transportRoutes.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faRoute} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No routes found. Create your first route to get started.</p>
            <button 
              onClick={handleManageRoutes}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Route
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transportRoutes.map((route) => (
              <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{route.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {route.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{route.vehicle || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium">{route.driver || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{route.occupied || 0}/{route.capacity || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Timing:</span>
                    <span className="font-medium text-xs">{route.timing || 'Not set'}</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${route.capacity > 0 ? ((route.occupied || 0) / route.capacity) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center mb-3">
                  {route.capacity > 0 ? (((route.occupied || 0) / route.capacity) * 100).toFixed(1) : 0}% occupied
                </div>
                
                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-gray-700">Stops:</p>
                  {route.stops && route.stops.length > 0 ? (
                    route.stops.map((stop, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-400 mr-1" />
                        {stop}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">No stops defined</div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewRouteDetails(route.id)}
                    className="flex-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleAllocateRoute(route.id)}
                    className="flex-1 bg-green-50 text-green-600 px-2 py-1 rounded text-xs hover:bg-green-100 transition-colors"
                  >
                    Allocate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Allocations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Route Allocations</h3>
          <button 
            onClick={() => navigateToTab('allocations')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        {recentAllocations.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No allocations found. Create your first allocation to get started.</p>
            <button 
              onClick={handleNewAllocation}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Allocation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Roll No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Pickup Point</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAllocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800">{allocation.studentName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{allocation.rollNo}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {allocation.route}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{allocation.pickup}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {allocation.date ? new Date(allocation.date).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        allocation.status === 'allocated' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAllocation(allocation.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-sm" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAllocation(allocation.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={handleNewAllocation}
          className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
        >
          <div className="text-center">
            <FontAwesomeIcon icon={faPlus} className="text-green-500 text-2xl mb-2" />
            <p className="font-medium text-green-800">New Allocation</p>
            <p className="text-sm text-green-600">Assign route to student</p>
          </div>
        </button>
        
        <button 
          onClick={handleManageRoutes}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="text-center">
            <FontAwesomeIcon icon={faRoute} className="text-blue-500 text-2xl mb-2" />
            <p className="font-medium text-blue-800">Manage Routes</p>
            <p className="text-sm text-blue-600">Add/edit transport routes</p>
          </div>
        </button>
        
        <button 
          onClick={handleRouteRequests}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
        >
          <div className="text-center">
            <FontAwesomeIcon icon={faUsers} className="text-purple-500 text-2xl mb-2" />
            <p className="font-medium text-purple-800">Route Requests</p>
            <p className="text-sm text-purple-600">View pending requests</p>
          </div>
        </button>
        
        <button 
          onClick={handleSchedule}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors"
        >
          <div className="text-center">
            <FontAwesomeIcon icon={faClock} className="text-orange-500 text-2xl mb-2" />
            <p className="font-medium text-orange-800">Schedule</p>
            <p className="text-sm text-orange-600">View timings</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TransportOverview;
