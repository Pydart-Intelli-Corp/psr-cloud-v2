'use client';

import { useState, useEffect } from 'react';

interface TokenData {
  exists: boolean;
  preview?: string;
  length: number;
}

interface UserData {
  exists?: boolean;
  error?: string;
  raw?: string;
  [key: string]: unknown;
}

export default function DiagnosticPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkStorage = () => {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      const tokenInfo: TokenData = {
        exists: !!token,
        preview: token ? token.substring(0, 50) + '...' : undefined,
        length: token ? token.length : 0
      };
      setTokenData(tokenInfo);

      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr);
          setUserData(user);
        } catch {
          setUserData({ error: 'Failed to parse user data', raw: userDataStr });
        }
      } else {
        setUserData({ exists: false });
      }
    };

    checkStorage();
  }, []);

  const testProfileAPI = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('No token found');
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('Profile API Test:', result);
      alert(`Profile API Response: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Profile API Error:', error);
      alert(`Error: ${error}`);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Diagnostic</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Token Information</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(tokenData, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">User Data</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6 space-x-4">
          <button
            onClick={testProfileAPI}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test Profile API
          </button>
          <button
            onClick={clearStorage}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Clear Storage & Reload
          </button>
          <a
            href="/login"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
          >
            Go to Login
          </a>
          <a
            href="/admin/dashboard"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 inline-block"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}