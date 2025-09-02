'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { DollarSign, Search, Download, Eye, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

interface Disbursement {
  disbursement_id: string;
  request_id: string;
  beneficiary: {
    first_name: string;
    last_name: string;
    beneficiary_id: string;
  };
  disbursement_amount: number;
  disbursement_method: 'Bank Transfer' | 'Cash' | 'Check' | 'Mobile Money';
  disbursement_status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  disbursement_date: string;
  processed_by?: {
    first_name: string;
    last_name: string;
  };
  reference_number?: string;
  disbursement_notes?: string;
  account_details?: string;
}

export default function DisbursementsPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  // Mock data
  useEffect(() => {
    const mockDisbursements: Disbursement[] = [
      {
        disbursement_id: 'DIS001',
        request_id: 'REQ002',
        beneficiary: {
          first_name: 'Juan',
          last_name: 'Cruz',
          beneficiary_id: 'BEN002'
        },
        disbursement_amount: 8000,
        disbursement_method: 'Bank Transfer',
        disbursement_status: 'Completed',
        disbursement_date: '2025-08-27',
        processed_by: {
          first_name: 'John',
          last_name: 'Doe'
        },
        reference_number: 'TXN20250827001',
        disbursement_notes: 'Educational assistance for school supplies',
        account_details: 'BDO - **** 4567'
      },
      {
        disbursement_id: 'DIS002',
        request_id: 'REQ004',
        beneficiary: {
          first_name: 'Lisa',
          last_name: 'Reyes',
          beneficiary_id: 'BEN004'
        },
        disbursement_amount: 12000,
        disbursement_method: 'Cash',
        disbursement_status: 'Processing',
        disbursement_date: '2025-08-28',
        processed_by: {
          first_name: 'Jane',
          last_name: 'Smith'
        },
        reference_number: 'CASH20250828001',
        disbursement_notes: 'Medical emergency assistance'
      },
      {
        disbursement_id: 'DIS003',
        request_id: 'REQ005',
        beneficiary: {
          first_name: 'Carlos',
          last_name: 'Martinez',
          beneficiary_id: 'BEN005'
        },
        disbursement_amount: 5500,
        disbursement_method: 'Mobile Money',
        disbursement_status: 'Pending',
        disbursement_date: '2025-08-29',
        disbursement_notes: 'Housing repair assistance',
        account_details: 'GCash - 09123456789'
      }
    ];

    setTimeout(() => {
      setDisbursements(mockDisbursements);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDisbursements = disbursements.filter(disbursement => {
    const matchesSearch = `${disbursement.beneficiary.first_name} ${disbursement.beneficiary.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disbursement.disbursement_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disbursement.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (disbursement.reference_number && disbursement.reference_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || disbursement.disbursement_status === statusFilter;
    const matchesMethod = methodFilter === 'All' || disbursement.disbursement_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'Bank Transfer': 'bg-blue-100 text-blue-800',
      'Cash': 'bg-green-100 text-green-800',
      'Check': 'bg-purple-100 text-purple-800',
      'Mobile Money': 'bg-orange-100 text-orange-800',
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Disbursements</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage financial aid disbursements to beneficiaries
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Disbursement
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disbursements..."
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
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Methods</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Disbursements</p>
                <p className="text-2xl font-bold text-gray-900">{disbursements.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disbursements.filter(d => d.disbursement_status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disbursements.filter(d => d.disbursement_status === 'Processing').length}
                </p>
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
                  {disbursements.filter(d => d.disbursement_status === 'Pending').length}
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
                  ₱{disbursements.reduce((sum, d) => sum + d.disbursement_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disbursements Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Disbursements ({filteredDisbursements.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading disbursements...</p>
            </div>
          ) : filteredDisbursements.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No disbursements found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disbursement ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
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
                  {filteredDisbursements.map((disbursement) => (
                    <tr key={disbursement.disbursement_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {disbursement.disbursement_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Request: {disbursement.request_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {disbursement.beneficiary.first_name} {disbursement.beneficiary.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {disbursement.beneficiary.beneficiary_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₱{disbursement.disbursement_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadge(disbursement.disbursement_method)}`}>
                          {disbursement.disbursement_method}
                        </span>
                        {disbursement.account_details && (
                          <div className="text-sm text-gray-500 mt-1">
                            {disbursement.account_details}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(disbursement.disbursement_status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(disbursement.disbursement_status)}`}>
                            {disbursement.disbursement_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {disbursement.reference_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(disbursement.disbursement_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Download className="h-4 w-4" />
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