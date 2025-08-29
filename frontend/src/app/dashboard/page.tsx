'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, CreditCard, Calendar, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, isProjectDirector, isBeneficiary } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const ProjectDirectorDashboard = () => {
    const subscription = user?.activeSubscription;
    const isTrialActive = subscription?.is_trial;
    const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.name}. Here's what's happening with your financial aid program.
          </p>
        </div>

        {/* Trial Alert */}
        {isTrialActive && daysRemaining > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Free Trial Active</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>Your free trial expires in {daysRemaining} days. Upgrade to continue managing beneficiaries.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Beneficiaries</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Beneficiaries</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Current Plan</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {subscription?.plan?.name || 'No Plan'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {isTrialActive ? 'Trial Days Left' : 'Days Remaining'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isTrialActive ? daysRemaining : 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/employees')}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors"
              >
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Employees</h4>
                <p className="text-sm text-gray-600">Add new employees and set their privileges</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/beneficiaries')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
              >
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Beneficiaries</h4>
                <p className="text-sm text-gray-600">Add, edit, or view beneficiary profiles</p>
              </button>
              
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors"
              >
                <CreditCard className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Subscription</h4>
                <p className="text-sm text-gray-600">Upgrade or manage your subscription</p>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const BeneficiaryDashboard = () => {
    const beneficiary = user?.beneficiaryProfile;

    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, {user?.name}. Here's your profile information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">My Profile</h3>
            {beneficiary ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Full Name: </span>
                  <span className="text-sm text-gray-900">
                    {beneficiary.first_name} {beneficiary.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email: </span>
                  <span className="text-sm text-gray-900">{beneficiary.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status: </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    beneficiary.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {beneficiary.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No beneficiary profile found.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/dashboard/profile')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
              >
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Update Profile</h4>
                <p className="text-sm text-gray-600">Edit your personal information</p>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout>
      {isProjectDirector && <ProjectDirectorDashboard />}
      {isBeneficiary && <BeneficiaryDashboard />}
    </DashboardLayout>
  );
}
