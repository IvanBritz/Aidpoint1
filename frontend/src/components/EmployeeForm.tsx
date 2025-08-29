'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Search, Users, Plus, Shield, Mail } from 'lucide-react';
import { employeeService, CreateEmployeeData } from '@/services/employeeService';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EmployeeFormData extends CreateEmployeeData {
  password_confirmation: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required').max(255, 'Name is too long'),
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().max(50, 'Username is too long').optional(),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
  phone: yup.string().optional(),
  address: yup.string().optional(),
  privileges: yup.array().of(yup.string()).default([]),
  position_id: yup.number().optional().nullable(),
}) as yup.ObjectSchema<EmployeeFormData>;

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availablePrivileges, setAvailablePrivileges] = useState<Record<string, string>>({});
  const [availablePositions, setAvailablePositions] = useState<{id: number, name: string, description?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [privilegesLoading, setPrivilegesLoading] = useState(false);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privilegesError, setPrivilegesError] = useState<string | null>(null);
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [privilegeFilter, setPrivilegeFilter] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState('');
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      password_confirmation: '',
      phone: '',
      address: '',
      privileges: [],
      position_id: null,
    },
  });

  const selectedPrivileges = watch('privileges') || [];
  const selectedPositionId = watch('position_id');

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPrivilegesError(null);
      setPositionsError(null);
      setShowSuccessMessage(false);
      setShowAddPosition(false);
      setNewPosition('');
      loadPrivileges();
      loadPositions();
      
      // Focus the first input when modal opens
      setTimeout(() => {
        if (initialFocusRef.current) {
          initialFocusRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const loadPrivileges = async () => {
    setPrivilegesLoading(true);
    setPrivilegesError(null);
    try {
      const response = await employeeService.getAvailablePrivileges();
      setAvailablePrivileges(response.privileges);
    } catch (error: unknown) {
      console.error('Failed to load privileges:', error);
      setPrivilegesError('Failed to load privileges. Please try again.');
    } finally {
      setPrivilegesLoading(false);
    }
  };

  const loadPositions = async () => {
    setPositionsLoading(true);
    setPositionsError(null);
    try {
      const response = await employeeService.getAvailablePositions();
      if (response.positions_full) {
        setAvailablePositions(response.positions_full);
      }
    } catch (error: unknown) {
      console.error('Failed to load positions:', error);
      setPositionsError('Failed to load positions. Please try again.');
    } finally {
      setPositionsLoading(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPosition.trim()) return;
    
    try {
      const response = await employeeService.createPosition({ name: newPosition.trim() });
      
      // Reload positions to get the updated list
      await loadPositions();
      
      setNewPosition('');
      setShowAddPosition(false);
    } catch (error: unknown) {
      console.error('Failed to create position:', error);
      setPositionsError('Failed to create position. Please try again.');
      setTimeout(() => setPositionsError(null), 5000);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    setError(null);
    
    console.log('Submitting employee data:', data);
    
    // Check authentication status
    const authToken = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!authToken) {
      setError('You are not logged in. Please log in and try again.');
      setLoading(false);
      return;
    }
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== 'project_director') {
          setError('Only Project Directors can create employee accounts. Your role: ' + user.role);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse user data from localStorage');
      }
    }
    
    // Prepare employee data for API call
    const employeeData: CreateEmployeeData = {
      name: data.name,
      email: data.email,
      username: data.username,
      position_id: data.position_id,
      password: data.password,
      password_confirmation: data.password_confirmation,
      phone: data.phone,
      address: data.address,
      privileges: data.privileges,
    };
    
    try {
      const result = await employeeService.createEmployee(employeeData);
      console.log('Employee created successfully:', result);
      
      reset();
      setShowSuccessMessage(true);
      
      // Wait briefly to show success message before closing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: unknown) {
      console.error('Failed to create employee:', error);
      
      // Extract error message from different response formats
      let errorMessage = 'Failed to create employee. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string; errors?: Record<string, string[]>; error?: string }; status?: number } };
        console.error('API Error Response:', axiosError.response);
        
        if (axiosError.response?.status === 401) {
          errorMessage = 'You are not logged in. Please log in and try again.';
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'You do not have permission to create employees. Only Project Directors can create employee accounts.';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.errors) {
          // Handle validation errors from Laravel
          const validationErrors = Object.values(axiosError.response.data.errors).flat();
          errorMessage = validationErrors.join(', ') || errorMessage;
        } else if (axiosError.response?.status) {
          errorMessage = `Request failed with status ${axiosError.response.status}. Please check your connection and try again.`;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const errorWithMessage = error as { message: string };
        if (errorWithMessage.message.includes('Network Error') || errorWithMessage.message.includes('ECONNREFUSED')) {
          errorMessage = 'Unable to connect to the server. Please ensure the backend server is running and try again.';
        } else {
          errorMessage = errorWithMessage.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivilegeChange = (privilege: string, checked: boolean) => {
    const currentPrivileges = selectedPrivileges;
    let newPrivileges: string[];

    if (checked) {
      newPrivileges = [...currentPrivileges, privilege];
    } else {
      newPrivileges = currentPrivileges.filter(p => p !== privilege);
    }

    setValue('privileges', newPrivileges);
  };
  
  // Filter available privileges based on search input
  const filteredPrivileges = Object.entries(availablePrivileges)
    .filter(([key, label]) => {
      return label.toLowerCase().includes(privilegeFilter.toLowerCase()) || 
             key.toLowerCase().includes(privilegeFilter.toLowerCase());
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-4 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Employee</h3>
                  <p className="text-blue-100 text-sm">Fill in the employee details below</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 focus:outline-none rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="px-6 py-6">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <p className="text-sm font-medium text-green-800">Employee created successfully!</p>
                </div>
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      id="name"
                      ref={initialFocusRef}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter employee full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="employee@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username (Optional)
                    </label>
                    <input
                      {...register('username')}
                      id="username"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Will be auto-generated if left blank"
                    />
                    {errors.username && (
                      <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      id="phone"
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label htmlFor="position_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      {...register('position_id')}
                      id="position_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a position (optional)</option>
                      {availablePositions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                        </option>
                      ))}
                    </select>
                    {errors.position_id && (
                      <p className="mt-1 text-xs text-red-500">{errors.position_id.message}</p>
                    )}
                    
                    {/* Add New Position Button */}
                    {!showAddPosition ? (
                      <button
                        type="button"
                        onClick={() => setShowAddPosition(true)}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add new position
                      </button>
                    ) : (
                      <div className="mt-2 p-2 bg-gray-50 rounded-md">
                        <input
                          type="text"
                          value={newPosition}
                          onChange={(e) => setNewPosition(e.target.value)}
                          placeholder="Enter position name"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={handleAddPosition}
                            disabled={!newPosition.trim() || positionsLoading}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddPosition(false);
                              setNewPosition('');
                            }}
                            className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {positionsError && (
                      <p className="mt-1 text-xs text-red-500">{positionsError}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      {...register('address')}
                      id="address"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter employee address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Security Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter temporary password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Employee will change this on first login</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        {...register('password_confirmation')}
                        id="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm the password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Privileges Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-purple-600" />
                  Access Privileges
                </h4>
                
                {privilegesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Loading privileges...</span>
                  </div>
                ) : privilegesError ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                      <p className="text-sm text-yellow-700">{privilegesError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={loadPrivileges}
                      className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(availablePrivileges).length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={privilegeFilter}
                          onChange={(e) => setPrivilegeFilter(e.target.value)}
                          placeholder="Search privileges..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className="bg-white border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                      {Object.entries(availablePrivileges).length === 0 ? (
                        <div className="p-4 text-center">
                          <Shield className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No privileges available</p>
                        </div>
                      ) : filteredPrivileges.length === 0 ? (
                        <div className="p-4 text-center">
                          <Search className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No matching privileges found</p>
                        </div>
                      ) : (
                        <div className="p-3 space-y-2">
                          {filteredPrivileges.map(([key, label]) => (
                            <label key={key} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPrivileges.includes(key)}
                                onChange={(e) => handlePrivilegeChange(key, e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 select-none">{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || showSuccessMessage}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Adding Employee...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Add Employee</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;