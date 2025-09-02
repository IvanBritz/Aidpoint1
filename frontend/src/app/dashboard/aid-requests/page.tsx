'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Search, Filter, CheckCircle, XCircle, Clock, Eye, DollarSign } from 'lucide-react';

interface AidRequest {
  request_id: string;
  beneficiary: {
    first_name: string;
    last_name: string;
    beneficiary_id: string;
  };
  request_type: 'Emergency' | 'Educational' | 'Medical' | 'Housing' | 'Food';
  request_amount: number;
  request_description: string;
  request_status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed';
  request_urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  request_date: string;
  reviewed_by?: {
    first_name: string;
    last_name: string;
  };
  review_date?: string;
  review_notes?: string;
}

export default function AidRequestsPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  // Mock data
  useEffect(() => {
    const mockRequests: AidRequest[] = [
      {
        request_id: 'REQ001',
        beneficiary: {
          first_name: 'Maria',
          last_name: 'Santos',
          beneficiary_id: 'BEN001'
        },
        request_type: 'Medical',
        request_amount: 15000,
        request_description: 'Emergency surgery for appendicitis',
        request_status: 'Pending',
        request_urgency: 'Critical',
        request_date: '2025-08-28'
      },
      {
        request_id: 'REQ002',
        beneficiary: {
          first_name: 'Juan',
          last_name: 'Cruz',
          beneficiary_id: 'BEN002'
        },
        request_type: 'Educational',
        request_amount: 8000,
        request_description: 'School supplies and tuition fee assistance',
        request_status: 'Approved',
        request_urgency: 'Medium',
        request_date: '2025-08-25',
        reviewed_by: {
          first_name: 'John',
          last_name: 'Doe'
        },
        review_date: '2025-08-26',
        review_notes: 'Approved for educational assistance program'
      },
      {
        request_id: 'REQ003',
        beneficiary: {
          first_name: 'Ana',
          last_name: 'Garcia',
          beneficiary_id: 'BEN003'
        },
        request_type: 'Emergency',
        request_amount: 5000,
        request_description: 'Flood damage repair assistance',
        request_status: 'Under Review',
        request_urgency: 'High',
        request_date: '2025-08-27'
      }
    ];

    setTimeout(() => {
      setAidRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = aidRequests.filter(request => {
    const matchesSearch = `${request.beneficiary.first_name} ${request.beneficiary.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || request.request_status === statusFilter;
    const matchesType = typeFilter === 'All' || request.request_type === typeFilter;
    const matchesUrgency = urgencyFilter === 'All' || request.request_urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesType && matchesUrgency;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Disbursed': 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800',
    };
    return colors[urgency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Emergency': 'bg-red-100 text-red-800',
      'Medical': 'bg-blue-100 text-blue-800',
      'Educational': 'bg-green-100 text-green-800',
      'Housing': 'bg-purple-100 text-purple-800',
      'Food': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated || !isProjectDirector) {
    return <div>Access denied</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aid Requests</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and manage financial aid requests from beneficiaries
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Disbursed">Disbursed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Emergency">Emergency</option>
                <option value="Medical">Medical</option>
                <option value="Educational">Educational</option>
                <option value="Housing">Housing</option>
                <option value="Food">Food</option>
              </select>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Urgency</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{aidRequests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {aidRequests.filter(r => r.request_status === 'Pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {aidRequests.filter(r => r.request_status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {aidRequests.filter(r => r.request_status === 'Rejected').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{aidRequests.reduce((sum, r) => sum + r.request_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Aid Requests ({filteredRequests.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading aid requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No aid requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.request_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.beneficiary.first_name} {request.beneficiary.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.beneficiary.beneficiary_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(request.request_type)}`}>
                            {request.request_type}
                          </span>
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            ₱{request.request_amount.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.request_status)}`}>
                          {request.request_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge(request.request_urgency)}`}>
                          {request.request_urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.request_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm border border-blue-600 rounded hover:bg-blue-50">
                            Review
                          </button>
                          <button className="text-gray-600 hover:text-gray-700">
                            <Eye className="h-4 w-4" />
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
    </DashboardLayout>
  );
}