import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faBuilding,
  faCheckCircle,
  faExclamationTriangle,
  faPlus,
  faEdit,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

const HostelOverview = ({ stats }) => {
  const [selectedBlock, setSelectedBlock] = useState("all");

  const hostelData = {
    required: stats?.Required || 0,
    notRequired: stats?.["Not Required"] || 0
  };

  const totalStudents = hostelData.required + hostelData.notRequired;
  const occupancyRate = totalStudents > 0 ? ((hostelData.required / totalStudents) * 100).toFixed(1) : 0;

  const hostelBlocks = [
    {
      id: "A",
      name: "Block A",
      totalRooms: 50,
      occupiedRooms: 45,
      capacity: 100,
      occupied: 90,
      type: "Boys"
    },
    {
      id: "B",
      name: "Block B",
      totalRooms: 40,
      occupiedRooms: 38,
      capacity: 80,
      occupied: 76,
      type: "Girls"
    },
    {
      id: "C",
      name: "Block C",
      totalRooms: 30,
      occupiedRooms: 25,
      capacity: 60,
      occupied: 50,
      type: "Boys"
    }
  ];

  const recentAllocations = [
    {
      id: 1,
      studentName: "John Doe",
      rollNo: "23CS001",
      block: "A",
      room: "A-101",
      date: "2024-01-15",
      status: "allocated"
    },
    {
      id: 2,
      studentName: "Sarah Wilson",
      rollNo: "23EE002",
      block: "B",
      room: "B-205",
      date: "2024-01-14",
      status: "allocated"
    },
    {
      id: 3,
      studentName: "Michael Brown",
      rollNo: "23ME003",
      block: "C",
      room: "C-103",
      date: "2024-01-13",
      status: "pending"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hostel Management</h2>
          <p className="text-gray-600">Manage student hostel accommodations and room allocations</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faPlus} />
            <span>Allocate Room</span>
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faBuilding} />
            <span>Manage Blocks</span>
          </button>
        </div>
      </div>

      {/* Hostel Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hostel Required</p>
              <p className="text-3xl font-bold text-green-800">{hostelData.required}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalStudents > 0 ? `${((hostelData.required / totalStudents) * 100).toFixed(1)}%` : '0%'} of students
              </p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              <FontAwesomeIcon icon={faHome} className="text-2xl text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-3xl font-bold text-blue-800">240</p>
              <p className="text-sm text-gray-500 mt-1">Across all blocks</p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              <FontAwesomeIcon icon={faBuilding} className="text-2xl text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-purple-800">{occupancyRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Current occupancy</p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              <FontAwesomeIcon icon={faUsers} className="text-2xl text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Block Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hostel Blocks Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hostelBlocks.map((block) => (
            <div key={block.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{block.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  block.type === 'Boys' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                }`}>
                  {block.type}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rooms:</span>
                  <span className="font-medium">{block.occupiedRooms}/{block.totalRooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{block.occupied}/{block.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(block.occupied / block.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {((block.occupied / block.capacity) * 100).toFixed(1)}% occupied
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-green-50 text-green-600 px-2 py-1 rounded text-xs hover:bg-green-100 transition-colors">
                  Allocate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Allocations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Room Allocations</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Roll No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Block</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
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
                      {allocation.block}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{allocation.room}</td>
                  <td className="py-3 px-4 text-gray-600">{allocation.date}</td>
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
                      <button className="text-blue-600 hover:text-blue-800">
                        <FontAwesomeIcon icon={faEdit} className="text-sm" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faPlus} className="text-green-500 text-2xl mb-2" />
            <p className="font-medium text-green-800">New Allocation</p>
            <p className="text-sm text-green-600">Assign room to student</p>
          </div>
        </button>
        
        <button className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-2xl mb-2" />
            <p className="font-medium text-blue-800">Manage Blocks</p>
            <p className="text-sm text-blue-600">Add/edit hostel blocks</p>
          </div>
        </button>
        
        <button className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faUsers} className="text-purple-500 text-2xl mb-2" />
            <p className="font-medium text-purple-800">Room Requests</p>
            <p className="text-sm text-purple-600">View pending requests</p>
          </div>
        </button>
        
        <button className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 text-2xl mb-2" />
            <p className="font-medium text-orange-800">Maintenance</p>
            <p className="text-sm text-orange-600">Report issues</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HostelOverview;
