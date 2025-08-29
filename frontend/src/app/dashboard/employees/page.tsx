'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import EmployeeList from '@/components/EmployeeList';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AlertCircle, User, RefreshCw } from 'lucide-react';

export default function EmployeesPage() {
  const { user, loading, isAuthenticated, isProjectDirector } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState({
    authToken: '',
    userData: '',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Debug information
    const authToken = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    setDebugInfo({
      authToken: authToken ? 'Present' : 'Missing',
      userData: userData ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    });

    console.log('EmployeesPage Debug Info:', {
      user,
      loading,
      isAuthenticated,
      isProjectDirector,
      authToken: authToken ? 'Present' : 'Missing',
      userData: userData ? JSON.parse(userData || '{}') : 'Missing'
    });

    if (!loading && !isAuthenticated) {
      console.log('Redirecting to login: Not authenticated');
      router.push('/auth/login');
    } else if (!loading && isAuthenticated && !isProjectDirector) {
      console.log('Redirecting to dashboard: Not project director');
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, isProjectDirector, router, user]);

  // Quick login helper function for development
  const quickLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'director@test.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        window.location.reload();
      } else {
        console.error('Quick login failed:', data);
      }
    } catch (error) {
      console.error('Quick login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>Debug: {debugInfo.timestamp}</p>
            <p>Token: {debugInfo.authToken}</p>
            <p>User Data: {debugInfo.userData}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Not Authenticated</h2>
          <p className="mt-2 text-sm text-gray-600">
            You need to be logged in to access this page.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={quickLogin}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Quick Login (Dev)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isProjectDirector) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <User className="w-12 h-12 text-orange-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            Only Project Directors can access employee management.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Your role: {user?.role || 'Unknown'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your employees and their access privileges
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <strong>Debug:</strong> Logged in as {user?.name} ({user?.role})
            </div>
          )}
        </div>

        <ErrorBoundary>
          <EmployeeList />
        </ErrorBoundary>
      </DashboardLayout>
    </ErrorBoundary>
  );
}