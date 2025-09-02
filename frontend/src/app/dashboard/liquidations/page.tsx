'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSearch, Search, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Liquidation {
  liquidation_id: string;
  disbursement_id: string;
  receipt_id: string;
  beneficiary: {
    first_name: string;
    last_name: string;
    beneficiary_id: string;
  };
  disbursement_amount: number;
  receipt_amount: number;
  variance_amount: number;
  liquidation_status: 'Complete' | 'Partial' | 'Excess' | 'Pending' | 'Under Review';
  liquidation_date: string;
  reviewed_by?: {
    first_name: string;
    last_name: string;
  };
  liquidation_notes?: string;
  variance_reason?: string;
}

export default function LiquidationsPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock data
  useEffect(() => {
    const mockLiquidations: Liquidation[] = [
      {
        liquidation_id: 'LIQ001',
        disbursement_id: 'DIS001',
        receipt_id: 'REC001',
        beneficiary: {
          first_name: 'Juan',
          last_name: 'Cruz',
          beneficiary_id: 'BEN002'
        },
        disbursement_amount: 8000,
        receipt_amount: 7500,
        variance_amount: 500,
        liquidation_status: 'Excess',
        liquidation_date: '2025-08-28',
        reviewed_by: {
          first_name: 'John',
          last_name: 'Doe'
        },
        liquidation_notes: 'Beneficiary has ₱500 remaining balance to be returned',
        variance_reason: 'Items cost less than expected'
      },
      {
        liquidation_id: 'LIQ002',
        disbursement_id: 'DIS002',
        receipt_id: 'REC002',
        beneficiary: {
          first_name: 'Lisa',
          last_name: 'Reyes',
          beneficiary_id: 'BEN004'
        },
        disbursement_amount: 12000,
        receipt_amount: 11200,
        variance_amount: 800,
        liquidation_status: 'Under Review',
        liquidation_date: '2025-08-29',
        liquidation_notes: 'Receipt amount matches closely with disbursement',
        variance_reason: 'Small variance within acceptable range'
      },
      {
        liquidation_id: 'LIQ003',
        disbursement_id: 'DIS003',
        receipt_id: 'REC003',
        beneficiary: {
          first_name: 'Maria',
          last_name: 'Santos',
          beneficiary_id: 'BEN001'
        },
        disbursement_amount: 5000,
        receipt_amount: 5000,
        variance_amount: 0,
        liquidation_status: 'Complete',
        liquidation_date: '2025-08-26',
        reviewed_by: {
          first_name: 'Jane',
          last_name: 'Smith'
        },
        liquidation_notes: 'Perfect match - full liquidation completed'
      }
    ];

    setTimeout(() => {
      setLiquidations(mockLiquidations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLiquidations = liquidations.filter(liquidation => {
    const matchesSearch = `${liquidation.beneficiary.first_name} ${liquidation.beneficiary.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liquidation.liquidation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liquidation.disbursement_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liquidation.receipt_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || liquidation.liquidation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'Complete': 'bg-green-100 text-green-800',
      'Partial': 'bg-yellow-100 text-yellow-800',
      'Excess': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-gray-100 text-gray-800',
      'Under Review': 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Excess':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'Partial':
        return <XCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVarianceDisplay = (variance: number, status: string) => {
    if (variance === 0) return 'No variance';
    if (variance > 0 && status === 'Excess') return `+₱${variance.toLocaleString()} (Excess)`;
    if (variance > 0) return `₱${variance.toLocaleString()} (Shortage)`;
    return `₱${Math.abs(variance).toLocaleString()}`;
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
            <h1 className="text-2xl font-bold text-gray-900">Liquidations</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and reconcile disbursements with expense receipts
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
                  placeholder="Search liquidations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Complete">Complete</option>
                <option value="Partial">Partial</option>
                <option value="Excess">Excess</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSearch className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Liquidations</p>
                <p className="text-2xl font-bold text-gray-900">{liquidations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complete</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liquidations.filter(l => l.liquidation_status === 'Complete').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partial</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liquidations.filter(l => l.liquidation_status === 'Partial').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Excess</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liquidations.filter(l => l.liquidation_status === 'Excess').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileSearch className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Variance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{liquidations.reduce((sum, l) => sum + Math.abs(l.variance_amount), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liquidations Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Liquidations ({filteredLiquidations.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading liquidations...</p>
            </div>
          ) : filteredLiquidations.length === 0 ? (
            <div className="p-8 text-center">
              <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No liquidations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liquidation ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disbursement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
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
                  {filteredLiquidations.map((liquidation) => (
                    <tr key={liquidation.liquidation_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {liquidation.liquidation_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {liquidation.disbursement_id} → {liquidation.receipt_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {liquidation.beneficiary.first_name} {liquidation.beneficiary.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {liquidation.beneficiary.beneficiary_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₱{liquidation.disbursement_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₱{liquidation.receipt_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          liquidation.variance_amount === 0 
                            ? 'text-green-600' 
                            : liquidation.liquidation_status === 'Excess' 
                            ? 'text-blue-600' 
                            : 'text-red-600'
                        }`}>
                          {getVarianceDisplay(liquidation.variance_amount, liquidation.liquidation_status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(liquidation.liquidation_status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(liquidation.liquidation_status)}`}>
                            {liquidation.liquidation_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(liquidation.liquidation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          {liquidation.liquidation_status === 'Under Review' && (
                            <button className="text-green-600 hover:text-green-700 px-2 py-1 text-xs border border-green-600 rounded hover:bg-green-50">
                              Review
                            </button>
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