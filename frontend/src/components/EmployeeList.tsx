'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, MapPin, Shield, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import { employeeService, Employee, EmployeeResponse } from '@/services/employeeService';
import EmployeeForm from './EmployeeForm';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePrivileges, setAvailablePrivileges] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, [currentPage]);

  const loadEmployees = async () => {
    console.log('EmployeeList: Loading employees...');
    setLoading(true);
    setError(null);
    try {
      const response: EmployeeResponse = await employeeService.getEmployees(currentPage);
      console.log('EmployeeList: Employees loaded successfully:', response);
      setEmployees(response.employees.data);
      setAvailablePrivileges(response.available_privileges);
      setCurrentPage(response.employees.current_page);
      setTotalPages(response.employees.last_page);
      setTotal(response.employees.total);
    } catch (error: any) {
      console.error('EmployeeList: Failed to load employees:', error);
      
      let errorMessage = 'Failed to load employees. Please try again.';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'Access denied. Only Project Directors can view employees.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadEmployees();
    setShowAddForm(false);
  };

  const handleDeactivateEmployee = async (employeeId: number) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await employeeService.deleteEmployee(employeeId);
        loadEmployees();
      } catch (error) {
        console.error('Failed to deactivate employee:', error);
        alert('Failed to deactivate employee. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatPrivileges = (privileges: string[]) => {
    if (!privileges || privileges.length === 0) {
      return <span className="text-gray-400 text-sm">No privileges assigned</span>;
    }
    
    const privilegeLabels = privileges.map(p => availablePrivileges[p] || p);
    
    if (privilegeLabels.length <= 2) {
      return (
        <div className="flex flex-wrap gap-1">
          {privilegeLabels.map((label, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {label}
            </span>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {privilegeLabels[0]}
        </span>
        <span className="text-xs text-gray-500">
          +{privilegeLabels.length - 1} more
        </span>
      </div>
    );
  };

  if (loading && employees.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading employees...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-gray-600" />
                Employee Management
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage your employees and their access privileges
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </button>
              <button
                onClick={async () => {
                  console.log('Testing API call...');
                  try {
                    const testData = {
                      name: 'Test Employee',
                      email: `test${Date.now()}@example.com`,
                      password: 'password123',
                      password_confirmation: 'password123',
                      privileges: ['aid_request']
                    };
                    const result = await employeeService.createEmployee(testData);
                    console.log('Test API call successful:', result);
                    alert('Test employee created successfully!');
                    loadEmployees();
                  } catch (error) {
                    console.error('Test API call failed:', error);
                    alert('Test API call failed - check console for details');
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Test API
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-medium">{total}</span>
              <span className="ml-1">{total === 1 ? 'employee' : 'employees'} total</span>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="divide-y divide-gray-200">
          {employees.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first employee account.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </button>
              </div>
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {employee.name}
                          </p>
                          <div className="ml-2">
                            {getStatusBadge(employee.status)}
                          </div>
                          {employee.must_change_password && (
                            <div className="ml-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Password Reset Required
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {employee.email}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-600">@{employee.username}</span>
                          </div>
                          {employee.position && (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {employee.position.name}
                              </span>
                            </div>
                          )}
                        </div>
                        {(employee.phone || employee.address) && (
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            {employee.phone && (
                              <div className="flex items-center">
                                <Phone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                {employee.phone}
                              </div>
                            )}
                            {employee.address && (
                              <div className="flex items-center">
                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span className="truncate max-w-xs">{employee.address}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-2 flex items-center">
                          <Shield className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 mr-2">Privileges:</span>
                          {formatPrivileges(employee.privileges)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Created {new Date(employee.created_at).toLocaleDateString()}
                          {employee.creator && (
                            <span> by {employee.creator.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeactivateEmployee(employee.id)}
                      className="p-2 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                      title="Deactivate Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Form Modal */}
      <EmployeeForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
};

export default EmployeeList;