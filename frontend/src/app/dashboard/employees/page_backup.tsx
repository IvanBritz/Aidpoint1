'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Search, Plus, Eye, Edit, Trash2, Shield } from 'lucide-react';
import api from '@/lib/api';

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone?: string;
  address?: string;
  position: string;
  employee_status: 'Active' | 'Inactive' | 'Suspended';
  hire_date: string;
  salary?: number;
  privileges?: {
    privilege_id: string;
    privilege_name: string;
    aid_request_access: boolean;
    disbursement_access: boolean;
    liquidation_access: boolean;
    audit_log_access: boolean;
    monitoring_access: boolean;
    receipts_access: boolean;
  };
  created_date: string;
}

interface NewEmployee {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  position: string;
  privileges: {
    aid_request_access: boolean;
    disbursement_access: boolean;
    liquidation_access: boolean;
    audit_log_access: boolean;
    monitoring_access: boolean;
    receipts_access: boolean;
  };
}

export default function EmployeesPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployeeData, setNewEmployeeData] = useState<NewEmployee>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    position: '',
    privileges: {
      aid_request_access: false,
      disbursement_access: false,
      liquidation_access: false,
      audit_log_access: false,
      monitoring_access: false,
      receipts_access: false,
    }
  });
  const [editEmployeeData, setEditEmployeeData] = useState<Partial<Employee>>({});
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (isAuthenticated && isProjectDirector) {
      fetchEmployees();
    }
  }, [isAuthenticated, isProjectDirector]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newEmployeeData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!newEmployeeData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!newEmployeeData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!newEmployeeData.email.includes('@') || !newEmployeeData.email.includes('.')) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newEmployeeData.username.trim()) {
      errors.username = 'Username is required';
    } else if (newEmployeeData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    
    if (!newEmployeeData.position.trim()) {
      errors.position = 'Position is required';
    }
    
    // Check if at least one privilege is selected
    const hasPrivileges = Object.values(newEmployeeData.privileges).some(privilege => privilege === true);
    if (!hasPrivileges) {
      errors.privileges = 'Please select at least one access privilege';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setNewEmployeeData({
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      position: '',
      privileges: {
        aid_request_access: false,
        disbursement_access: false,
        liquidation_access: false,
        audit_log_access: false,
        monitoring_access: false,
        receipts_access: false,
      }
    });
    setFormErrors({});
  };

  const handleAddEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreatingEmployee(true);
    setFormErrors({});

    try {
      const response = await api.post('/employees', newEmployeeData);
      
      if (response.data) {
        setCreatedEmployee(response.data);
        setShowAddModal(false);
        setShowPasswordModal(true);
        await fetchEmployees(); // Refresh the list
        resetForm();
      }
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        setFormErrors({ 
          general: error.response?.data?.message || 'Failed to create employee. Please try again.' 
        });
      }
    } finally {
      setIsCreatingEmployee(false);
    }
  };

  const handleViewEmployee = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      username: employee.username,
      phone: employee.phone,
      address: employee.address,
      position: employee.position,
      salary: employee.salary,
      employee_status: employee.employee_status,
      privileges: employee.privileges ? {
        aid_request_access: employee.privileges.aid_request_access,
        disbursement_access: employee.privileges.disbursement_access,
        liquidation_access: employee.privileges.liquidation_access,
        audit_log_access: employee.privileges.audit_log_access,
        monitoring_access: employee.privileges.monitoring_access,
        receipts_access: employee.privileges.receipts_access,
      } : undefined
    });
    setShowEditModal(true);
    setFormErrors({});
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    setIsUpdatingEmployee(true);
    setFormErrors({});
    setMessage(null);

    try {
      await api.put(`/employees/${selectedEmployee.employee_id}`, editEmployeeData);
      setMessage({ type: 'success', text: 'Employee updated successfully!' });
      setShowEditModal(false);
      await fetchEmployees();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        setFormErrors({ 
          general: error.response?.data?.message || 'Failed to update employee. Please try again.' 
        });
      }
    } finally {
      setIsUpdatingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/employees/${employeeId}`);
      setMessage({ type: 'success', text: 'Employee deleted successfully!' });
      await fetchEmployees();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete employee. Please try again.' 
      });
      
      // Clear message after 5 seconds for errors
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || employee.employee_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Suspended: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const countPrivileges = (privileges: any) => {
    if (!privileges) return 0;
    return Object.values(privileges).filter(value => value === true).length;
  };

  if (!isAuthenticated || !isProjectDirector) {
    return <div>Access denied</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your employees and their access privileges
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => e.employee_status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => e.employee_status === 'Inactive').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => e.employee_status === 'Suspended').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Employees ({filteredEmployees.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No employees found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add your first employee
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Privileges
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hire Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.employee_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{employee.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.email}</div>
                        <div className="text-sm text-gray-500">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(employee.employee_status)}`}>
                          {employee.employee_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {countPrivileges(employee.privileges)}/6 privileges
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewEmployee(employee)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="text-gray-600 hover:text-gray-700"
                            title="Edit Employee"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(employee.employee_id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Employee"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[9999]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isCreatingEmployee) {
              setShowAddModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="w-full max-w-3xl mx-auto my-8"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div 
              className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl"
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                borderRadius: '12px 12px 0 0'
              }}
            >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Add New Employee</h3>
                  <button
                    onClick={() => {
                      if (!isCreatingEmployee) {
                        setShowAddModal(false);
                        resetForm();
                      }
                    }}
                    disabled={isCreatingEmployee}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Fill in the details to create a new employee account
                </p>
              </div>

            {/* Form Content */}
            <div 
              className="px-6 py-6"
              style={{
                padding: '24px',
                backgroundColor: 'white'
              }}
            >
              {/* General Error */}
                {formErrors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700">{formErrors.general}</p>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }}>
                  {/* Employee Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Employee Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="first_name"
                          type="text"
                          value={newEmployeeData.first_name}
                          onChange={(e) => setNewEmployeeData({...newEmployeeData, first_name: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter first name"
                          disabled={isCreatingEmployee}
                        />
                        {formErrors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="last_name"
                          type="text"
                          value={newEmployeeData.last_name}
                          onChange={(e) => setNewEmployeeData({...newEmployeeData, last_name: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter last name"
                          disabled={isCreatingEmployee}
                        />
                        {formErrors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Position <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="position"
                        type="text"
                        value={newEmployeeData.position}
                        onChange={(e) => setNewEmployeeData({...newEmployeeData, position: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Financial Aid Officer"
                        disabled={isCreatingEmployee}
                      />
                      {formErrors.position && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Account Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={newEmployeeData.email}
                          onChange={(e) => setNewEmployeeData({...newEmployeeData, email: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="employee@company.com"
                          disabled={isCreatingEmployee}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="username"
                          type="text"
                          value={newEmployeeData.username}
                          onChange={(e) => setNewEmployeeData({...newEmployeeData, username: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="employee123"
                          disabled={isCreatingEmployee}
                        />
                        {formErrors.username && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Automatic Password Generation</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            A default password will be automatically generated for this employee using their first name and username. 
                            They will be required to change it on their first login.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privileges */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Access Privileges <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-sm text-gray-600">Select at least one access privilege for this employee.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'aid_request_access', label: 'Aid Request Management', desc: 'Create and manage aid requests' },
                        { key: 'disbursement_access', label: 'Financial Disbursements', desc: 'Process and approve disbursements' },
                        { key: 'liquidation_access', label: 'Liquidation Processing', desc: 'Handle liquidation workflows' },
                        { key: 'audit_log_access', label: 'Audit Log Access', desc: 'View system audit logs' },
                        { key: 'monitoring_access', label: 'System Monitoring', desc: 'Monitor system performance' },
                        { key: 'receipts_access', label: 'Receipt Management', desc: 'Manage and verify receipts' },
                      ].map((privilege) => (
                        <label key={privilege.key} className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                          formErrors.privileges ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}>
                          <input
                            type="checkbox"
                            checked={newEmployeeData.privileges[privilege.key as keyof typeof newEmployeeData.privileges]}
                            onChange={(e) => setNewEmployeeData({
                              ...newEmployeeData,
                              privileges: {
                                ...newEmployeeData.privileges,
                                [privilege.key]: e.target.checked
                              }
                            })}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isCreatingEmployee}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{privilege.label}</span>
                            <p className="text-xs text-gray-500">{privilege.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {formErrors.privileges && (
                      <p className="text-sm text-red-600">{formErrors.privileges}</p>
                    )}
                  </div>
                </form>
            </div>

            {/* Footer */}
            <div 
              className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl"
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                borderRadius: '0 0 12px 12px',
                padding: '16px 24px'
              }}
            >
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isCreatingEmployee) {
                      setShowAddModal(false);
                      resetForm();
                    }
                  }}
                    disabled={isCreatingEmployee}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddEmployee}
                    disabled={isCreatingEmployee}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingEmployee ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Employee'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              {/* Header */}
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Employee Details</h3>
                      <p className="text-sm text-blue-700">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-base text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-base text-gray-900 font-mono">{selectedEmployee.username}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-base text-gray-900">{selectedEmployee.phone || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-base text-gray-900">{selectedEmployee.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Position</label>
                      <p className="text-base text-gray-900">{selectedEmployee.position}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedEmployee.employee_status === 'Active' ? 'bg-green-100 text-green-800' :
                        selectedEmployee.employee_status === 'Inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedEmployee.employee_status}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hire Date</label>
                      <p className="text-base text-gray-900">{new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Salary</label>
                      <p className="text-base text-gray-900">{selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Privileges */}
                {selectedEmployee.privileges && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 mb-3 block">Access Privileges</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'aid_request_access', label: 'Aid Request Management' },
                        { key: 'disbursement_access', label: 'Financial Disbursements' },
                        { key: 'liquidation_access', label: 'Liquidation Processing' },
                        { key: 'audit_log_access', label: 'Audit Log Access' },
                        { key: 'monitoring_access', label: 'System Monitoring' },
                        { key: 'receipts_access', label: 'Receipt Management' },
                      ].map((privilege) => (
                        <div key={privilege.key} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedEmployee.privileges?.[privilege.key as keyof typeof selectedEmployee.privileges] 
                              ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className={`text-sm ${
                            selectedEmployee.privileges?.[privilege.key as keyof typeof selectedEmployee.privileges] 
                              ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {privilege.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditEmployee(selectedEmployee);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Employee
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Edit Employee</h3>
                  <button
                    onClick={() => {
                      if (!isUpdatingEmployee) {
                        setShowEditModal(false);
                        setFormErrors({});
                      }
                    }}
                    disabled={isUpdatingEmployee}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-6 py-6">
                {formErrors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{formErrors.general}</p>
                  </div>
                )}

                <form className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Basic Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editEmployeeData.first_name || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, first_name: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg ${formErrors.first_name ? 'border-red-300' : 'border-gray-300'}`}
                          disabled={isUpdatingEmployee}
                        />
                        {formErrors.first_name && <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editEmployeeData.last_name || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, last_name: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg ${formErrors.last_name ? 'border-red-300' : 'border-gray-300'}`}
                          disabled={isUpdatingEmployee}
                        />
                        {formErrors.last_name && <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editEmployeeData.email || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, email: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                          disabled={isUpdatingEmployee}
                        />
                        {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editEmployeeData.username || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, username: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg ${formErrors.username ? 'border-red-300' : 'border-gray-300'}`}
                          disabled={isUpdatingEmployee}
                        />
                        {formErrors.username && <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={editEmployeeData.phone || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={isUpdatingEmployee}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={editEmployeeData.position || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, position: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg ${formErrors.position ? 'border-red-300' : 'border-gray-300'}`}
                          disabled={isUpdatingEmployee}
                        />
                        {formErrors.position && <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={editEmployeeData.address || ''}
                        onChange={(e) => setEditEmployeeData({...editEmployeeData, address: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        disabled={isUpdatingEmployee}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={editEmployeeData.employee_status || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, employee_status: e.target.value as 'Active' | 'Inactive' | 'Suspended'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={isUpdatingEmployee}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Salary
                        </label>
                        <input
                          type="number"
                          value={editEmployeeData.salary || ''}
                          onChange={(e) => setEditEmployeeData({...editEmployeeData, salary: parseFloat(e.target.value) || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={isUpdatingEmployee}
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Privileges */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Access Privileges
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'aid_request_access', label: 'Aid Request Management' },
                        { key: 'disbursement_access', label: 'Financial Disbursements' },
                        { key: 'liquidation_access', label: 'Liquidation Processing' },
                        { key: 'audit_log_access', label: 'Audit Log Access' },
                        { key: 'monitoring_access', label: 'System Monitoring' },
                        { key: 'receipts_access', label: 'Receipt Management' },
                      ].map((privilege) => (
                        <label key={privilege.key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editEmployeeData.privileges?.[privilege.key as keyof typeof editEmployeeData.privileges] || false}
                            onChange={(e) => setEditEmployeeData({
                              ...editEmployeeData,
                              privileges: {
                                ...editEmployeeData.privileges,
                                [privilege.key]: e.target.checked
                              }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isUpdatingEmployee}
                          />
                          <span className="text-sm font-medium text-gray-900">{privilege.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isUpdatingEmployee) {
                        setShowEditModal(false);
                        setFormErrors({});
                      }
                    }}
                    disabled={isUpdatingEmployee}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateEmployee}
                    disabled={isUpdatingEmployee}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isUpdatingEmployee ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Employee'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && createdEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
              {/* Header */}
              <div className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Employee Created Successfully!</h3>
                    <p className="text-sm text-green-700">Please save these credentials securely</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee Name:</label>
                    <p className="text-base text-gray-900 font-medium">
                      {createdEmployee.employee.first_name} {createdEmployee.employee.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email:</label>
                    <p className="text-sm text-gray-600">{createdEmployee.employee.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username:</label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {createdEmployee.employee.username}
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg className="h-5 w-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <label className="text-sm font-medium text-amber-800">
                        Temporary Password (Save this!)
                      </label>
                    </div>
                    <div className="bg-white border border-amber-300 rounded p-3">
                      <p className="text-lg font-mono text-center font-bold text-gray-900 break-all">
                        {createdEmployee.employee.default_password}
                      </p>
                    </div>
                    <div className="mt-2 text-xs text-amber-700">
                      <p><strong>Pattern:</strong> firstname + last 4 characters of username</p>
                      <p className="mt-1"><strong>Important:</strong> The employee must change this password on first login.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
                <div className="flex space-x-3">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createdEmployee.employee.full_password);
                        // Show brief success feedback
                        const button = document.activeElement as HTMLButtonElement;
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        button.classList.add('bg-green-600', 'hover:bg-green-700');
                        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                        setTimeout(() => {
                          button.textContent = originalText;
                          button.classList.remove('bg-green-600', 'hover:bg-green-700');
                          button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                        }, 2000);
                      } catch (err) {
                        alert('Failed to copy to clipboard. Please copy manually.');
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setCreatedEmployee(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}