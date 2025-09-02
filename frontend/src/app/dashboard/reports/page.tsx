'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, Download, Eye, Calendar, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';

interface ReportData {
  beneficiaries: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  aidRequests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
  };
  disbursements: {
    total: number;
    completed: number;
    processing: number;
    totalAmount: number;
  };
  liquidations: {
    total: number;
    complete: number;
    partial: number;
    excess: number;
    totalVariance: number;
  };
}

const REPORT_TYPES = [
  {
    id: 'beneficiary-summary',
    name: 'Beneficiary Summary Report',
    description: 'Overview of all beneficiaries and their status',
    icon: Users,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'aid-requests-analysis',
    name: 'Aid Requests Analysis',
    description: 'Detailed analysis of aid requests by type and status',
    icon: FileText,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'financial-summary',
    name: 'Financial Summary Report',
    description: 'Complete financial overview of disbursements and expenses',
    icon: DollarSign,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'liquidation-report',
    name: 'Liquidation Report',
    description: 'Track receipt submissions and liquidation status',
    icon: BarChart3,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'monthly-trends',
    name: 'Monthly Trends Report',
    description: 'Monthly trends and performance metrics',
    icon: TrendingUp,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'Audit trail and compliance documentation',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-600'
  }
];

export default function ReportsPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('30'); // days
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Mock data
  useEffect(() => {
    const mockData: ReportData = {
      beneficiaries: {
        total: 125,
        active: 98,
        inactive: 27,
        newThisMonth: 15
      },
      aidRequests: {
        total: 67,
        pending: 8,
        approved: 45,
        rejected: 14,
        totalAmount: 847500
      },
      disbursements: {
        total: 45,
        completed: 38,
        processing: 7,
        totalAmount: 692300
      },
      liquidations: {
        total: 38,
        complete: 30,
        partial: 5,
        excess: 3,
        totalVariance: 25800
      }
    };

    setTimeout(() => {
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedDateRange]);

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratingReport(null);
    
    // In a real app, this would trigger a download
    alert(`${REPORT_TYPES.find(r => r.id === reportType)?.name} generated successfully!`);
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
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Generate comprehensive reports and analytics for your financial aid program
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading report data...</p>
          </div>
        ) : reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Beneficiaries</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.beneficiaries.total}</p>
                  <p className="text-sm text-green-600">
                    +{reportData.beneficiaries.newThisMonth} this month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aid Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.aidRequests.total}</p>
                  <p className="text-sm text-blue-600">
                    {reportData.aidRequests.approved} approved
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
                  <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{reportData.disbursements.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    {reportData.disbursements.completed} completed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Liquidations</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.liquidations.total}</p>
                  <p className="text-sm text-green-600">
                    {reportData.liquidations.complete} complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {reportData && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Statistics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Beneficiary Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active</span>
                      <span className="text-sm font-medium text-green-600">{reportData.beneficiaries.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Inactive</span>
                      <span className="text-sm font-medium text-red-600">{reportData.beneficiaries.inactive}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Request Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-medium text-yellow-600">{reportData.aidRequests.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="text-sm font-medium text-green-600">{reportData.aidRequests.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="text-sm font-medium text-red-600">{reportData.aidRequests.rejected}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Liquidation Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Complete</span>
                      <span className="text-sm font-medium text-green-600">{reportData.liquidations.complete}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Partial</span>
                      <span className="text-sm font-medium text-yellow-600">{reportData.liquidations.partial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Excess</span>
                      <span className="text-sm font-medium text-blue-600">{reportData.liquidations.excess}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Generation */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generate Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select from various report types to generate comprehensive documentation
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REPORT_TYPES.map((report) => {
                const Icon = report.icon;
                const isGenerating = generatingReport === report.id;
                
                return (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${report.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{report.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={isGenerating}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Generate
                          </>
                        )}
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                { name: 'Monthly Financial Summary - August 2025', date: '2025-08-29', size: '2.4 MB' },
                { name: 'Beneficiary Report - Q3 2025', date: '2025-08-25', size: '1.8 MB' },
                { name: 'Aid Requests Analysis - August 2025', date: '2025-08-20', size: '3.1 MB' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">Generated on {report.date} • {report.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-700 p-1">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-700 p-1">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}