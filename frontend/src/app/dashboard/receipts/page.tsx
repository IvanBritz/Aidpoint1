'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Receipt, Search, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ReceiptRecord {
  receipt_id: string;
  disbursement_id: string;
  beneficiary: {
    first_name: string;
    last_name: string;
    beneficiary_id: string;
  };
  receipt_type: 'Official Receipt' | 'Sales Invoice' | 'Delivery Receipt' | 'Other';
  receipt_amount: number;
  receipt_date: string;
  receipt_status: 'Pending Review' | 'Approved' | 'Rejected' | 'Under Review';
  vendor_name: string;
  receipt_description: string;
  uploaded_by?: {
    first_name: string;
    last_name: string;
  };
  upload_date: string;
  file_url?: string;
}

export default function ReceiptsPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Mock data
  useEffect(() => {
    const mockReceipts: ReceiptRecord[] = [
      {
        receipt_id: 'REC001',
        disbursement_id: 'DIS001',
        beneficiary: {
          first_name: 'Juan',
          last_name: 'Cruz',
          beneficiary_id: 'BEN002'
        },
        receipt_type: 'Official Receipt',
        receipt_amount: 7500,
        receipt_date: '2025-08-27',
        receipt_status: 'Approved',
        vendor_name: 'ABC School Supply Store',
        receipt_description: 'School supplies and books for educational assistance',
        uploaded_by: {
          first_name: 'Juan',
          last_name: 'Cruz'
        },
        upload_date: '2025-08-28',
        file_url: '/receipts/REC001.pdf'
      },
      {
        receipt_id: 'REC002',
        disbursement_id: 'DIS002',
        beneficiary: {
          first_name: 'Lisa',
          last_name: 'Reyes',
          beneficiary_id: 'BEN004'
        },
        receipt_type: 'Sales Invoice',
        receipt_amount: 11200,
        receipt_date: '2025-08-28',
        receipt_status: 'Under Review',
        vendor_name: 'City General Hospital',
        receipt_description: 'Medical treatment and prescription medicines',
        uploaded_by: {
          first_name: 'Lisa',
          last_name: 'Reyes'
        },
        upload_date: '2025-08-29',
        file_url: '/receipts/REC002.pdf'
      }
    ];

    setTimeout(() => {
      setReceipts(mockReceipts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = `${receipt.beneficiary.first_name} ${receipt.beneficiary.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.receipt_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.receipt_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || receipt.receipt_status === statusFilter;
    const matchesType = typeFilter === 'All' || receipt.receipt_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'Pending Review': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
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
            <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and verify expense receipts from beneficiaries
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
                  placeholder="Search receipts..."
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
                <option value="Pending Review">Pending Review</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Official Receipt">Official Receipt</option>
                <option value="Sales Invoice">Sales Invoice</option>
                <option value="Delivery Receipt">Delivery Receipt</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receipts.filter(r => r.receipt_status === 'Pending Review').length}
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
                  {receipts.filter(r => r.receipt_status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{receipts.reduce((sum, r) => sum + r.receipt_amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Receipts ({filteredReceipts.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading receipts...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No receipts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor & Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.receipt_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.receipt_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Disbursement: {receipt.disbursement_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.beneficiary.first_name} {receipt.beneficiary.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {receipt.beneficiary.beneficiary_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.vendor_name}
                          </div>
                          <div className="text-sm text-gray-900 font-semibold">
                            ₱{receipt.receipt_amount.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {receipt.receipt_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(receipt.receipt_status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(receipt.receipt_status)}`}>
                            {receipt.receipt_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(receipt.receipt_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Download className="h-4 w-4" />
                          </button>
                          {receipt.receipt_status === 'Pending Review' && (
                            <>
                              <button className="text-green-600 hover:text-green-700 px-2 py-1 text-xs border border-green-600 rounded hover:bg-green-50">
                                Approve
                              </button>
                              <button className="text-red-600 hover:text-red-700 px-2 py-1 text-xs border border-red-600 rounded hover:bg-red-50">
                                Reject
                              </button>
                            </>
                          )}
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