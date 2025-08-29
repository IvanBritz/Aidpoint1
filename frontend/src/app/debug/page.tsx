'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await api.get('/test');
      setTestResult({ success: true, data: response.data });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data || error.message || 'Unknown error',
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'project_director'
      });
      setTestResult({ success: true, data: response.data });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data || error.message || 'Unknown error',
        status: error.response?.status,
        fullError: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testSimpleRegister = async () => {
    setLoading(true);
    try {
      const response = await api.post('/test-register', {
        name: 'Test User',
        email: 'test@example.com',
        role: 'project_director'
      });
      setTestResult({ success: true, data: response.data });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data || error.message || 'Unknown error',
        status: error.response?.status,
        fullError: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Debug Page</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>

          <button
            onClick={testRegister}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Registration'}
          </button>

          <button
            onClick={testSimpleRegister}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Simple Register'}
          </button>
        </div>

        {testResult && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Result: {testResult.success ? 'Success' : 'Error'}
            </h2>
            
            {testResult.success ? (
              <div className="text-green-600">
                <h3 className="font-semibold">Response:</h3>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">
                <h3 className="font-semibold">Error (Status: {testResult.status}):</h3>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Configuration Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
