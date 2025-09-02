'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, Search, Eye, Download, User, FileText, DollarSign, Settings } from 'lucide-react';

interface AuditLog {
  log_id: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT';
  table_name: string;
  record_id: string;
  user: {
    first_name: string;
    last_name: string;
    user_type: string;
  };
  action_description: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  action_timestamp: string;
}

export default function AuditLogsPage() {
  const { isAuthenticated, isProjectDirector } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [tableFilter, setTableFilter] = useState('All');
  const [dateRange, setDateRange] = useState('7'); // days

  // Mock data
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        log_id: 'LOG001',
        action_type: 'CREATE',
        table_name: 'beneficiaries',
        record_id: 'BEN001',
        user: {
          first_name: 'Test',
          last_name: 'Director',
          user_type: 'Admin'
        },
        action_description: 'Created new beneficiary profile for Maria Santos',
        new_values: {
          first_name: 'Maria',
          last_name: 'Santos',
          email: 'maria.santos@email.com'
        },
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action_timestamp: '2025-08-29T10:30:00Z'
      },
      {
        log_id: 'LOG002',
        action_type: 'APPROVE',
        table_name: 'aid_requests',
        record_id: 'REQ002',
        user: {
          first_name: 'John',
          last_name: 'Doe',
          user_type: 'Employee'
        },
        action_description: 'Approved aid request for educational assistance',
        old_values: {
          request_status: 'Pending'
        },
        new_values: {
          request_status: 'Approved',
          review_notes: 'Approved for educational assistance program'
        },
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action_timestamp: '2025-08-29T09:15:00Z'
      },
      {
        log_id: 'LOG003',
        action_type: 'UPDATE',
        table_name: 'disbursements',
        record_id: 'DIS001',
        user: {
          first_name: 'Jane',
          last_name: 'Smith',
          user_type: 'Employee'
        },
        action_description: 'Updated disbursement status to completed',
        old_values: {
          disbursement_status: 'Processing'
        },
        new_values: {
          disbursement_status: 'Completed',
          reference_number: 'TXN20250827001'
        },
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        action_timestamp: '2025-08-29T08:45:00Z'
      },
      {
        log_id: 'LOG004',
        action_type: 'LOGIN',
        table_name: 'users',
        record_id: 'USER001',
        user: {
          first_name: 'Test',
          last_name: 'Director',
          user_type: 'Admin'
        },
        action_description: 'User logged into the system',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action_timestamp: '2025-08-29T08:00:00Z'
      },
      {
        log_id: 'LOG005',
        action_type: 'DELETE',
        table_name: 'employees',
        record_id: 'EMP005',
        user: {
          first_name: 'Test',
          last_name: 'Director',
          user_type: 'Admin'
        },
        action_description: 'Removed employee from system',
        old_values: {
          first_name: 'Former',
          last_name: 'Employee',
          employee_status: 'Active'
        },
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action_timestamp: '2025-08-28T16:30:00Z'
      }
    ];

    setTimeout(() => {
      setAuditLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${log.user.first_name} ${log.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.record_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action_type === actionFilter;
    const matchesTable = tableFilter === 'All' || log.table_name === tableFilter;
    
    // Date filter
    const logDate = new Date(log.action_timestamp);
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    const matchesDate = logDate >= cutoffDate;
    
    return matchesSearch && matchesAction && matchesTable && matchesDate;
  });

  const getActionBadge = (action: string) => {
    const colors = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'LOGIN': 'bg-purple-100 text-purple-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'APPROVE': 'bg-green-100 text-green-800',
      'REJECT': 'bg-red-100 text-red-800',
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTableIcon = (table: string) => {
    const icons = {
      'users': User,
      'beneficiaries': User,
      'employees': User,
      'aid_requests': FileText,
      'disbursements': DollarSign,
      'receipts': FileText,
      'liquidations': FileText,
    };
    const Icon = icons[table as keyof typeof icons] || Settings;
    return <Icon className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track all system activities and user actions for security and compliance
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Logs
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
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Tables</option>
                <option value="users">Users</option>
                <option value="beneficiaries">Beneficiaries</option>
                <option value="employees">Employees</option>
                <option value="aid_requests">Aid Requests</option>
                <option value="disbursements">Disbursements</option>
                <option value="receipts">Receipts</option>
                <option value="liquidations">Liquidations</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(auditLogs.map(log => `${log.user.first_name} ${log.user.last_name}`)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tables Affected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(auditLogs.map(log => log.table_name)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.filter(log => ['LOGIN', 'LOGOUT', 'DELETE'].includes(log.action_type)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Audit Trail ({filteredLogs.length} entries)
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found for the selected criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table/Record
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => {
                    const timestamp = formatTimestamp(log.action_timestamp);
                    return (
                      <tr key={log.log_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {timestamp.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {timestamp.time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.user.first_name} {log.user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.user.user_type}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadge(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 rounded mr-2">
                              {getTableIcon(log.table_name)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.table_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.record_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {log.action_description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}