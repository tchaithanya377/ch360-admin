import React, { useState } from 'react';
import { FaCopy, FaCheck, FaCode, FaGlobe, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

const LogoutApiDocumentation = () => {
  const [copiedItem, setCopiedItem] = useState(null);

  const copyToClipboard = async (text, itemName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const apiEndpoint = '/api/accounts/logout/';
  const baseUrl = import.meta.env.DEV ? 'http://127.0.0.1:8000' : 'https://campushub-backend1.onrender.com';
  const fullUrl = `${baseUrl}${apiEndpoint}`;

  const curlExample = `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`;

  const javascriptExample = `// Using fetch API
const logoutUser = async () => {
  try {
    const response = await fetch('${fullUrl}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${localStorage.getItem('django_token')}\`
      }
    });
    
    if (response.ok) {
      console.log('Logout successful');
      // Clear local tokens
      localStorage.removeItem('django_token');
      localStorage.removeItem('django_refresh_token');
    } else {
      console.error('Logout failed:', response.status);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};`;

  const pythonExample = `import requests

def logout_user():
    url = "${fullUrl}"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    
    try:
        response = requests.post(url, headers=headers)
        if response.status_code == 200:
            print("Logout successful")
        else:
            print(f"Logout failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")`;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Logout API Documentation</h1>
          <p className="text-blue-100 mt-1">Complete guide for the POST /api/accounts/logout/ endpoint</p>
        </div>

        <div className="p-6 space-y-8">
          {/* API Overview */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaGlobe className="mr-2 text-blue-500" />
              API Overview
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Endpoint</h3>
                  <p className="text-gray-600 font-mono">{apiEndpoint}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Method</h3>
                  <p className="text-gray-600">POST</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Base URL</h3>
                  <p className="text-gray-600 font-mono text-sm">{baseUrl}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Full URL</h3>
                  <p className="text-gray-600 font-mono text-sm">{fullUrl}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-green-500" />
              Authentication
            </h2>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800">
                <strong>Required:</strong> Bearer Token (JWT) in Authorization header
              </p>
              <p className="text-green-700 text-sm mt-2">
                The logout endpoint requires a valid JWT access token to identify the user session to terminate.
              </p>
            </div>
          </section>

          {/* Request Format */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaCode className="mr-2 text-purple-500" />
              Request Format
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Headers</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700">
{`Content-Type: application/json
Authorization: Bearer <your_jwt_token>`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Body</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">No request body required. The endpoint uses the JWT token to identify the session.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Response Format */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Format</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Success Response (200 OK)</h3>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">Status: 200 OK</p>
                  <p className="text-green-700 text-sm mt-1">Empty response body or simple success message</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Error Responses</h3>
                <div className="space-y-2">
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-red-800 font-medium">401 Unauthorized</p>
                    <p className="text-red-700 text-sm">Invalid or expired token</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-red-800 font-medium">500 Internal Server Error</p>
                    <p className="text-red-700 text-sm">Server-side error during logout</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Examples</h2>
            
            <div className="space-y-6">
              {/* cURL Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">cURL</h3>
                  <button
                    onClick={() => copyToClipboard(curlExample, 'curl')}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {copiedItem === 'curl' ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
                    {copiedItem === 'curl' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{curlExample}</pre>
                </div>
              </div>

              {/* JavaScript Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">JavaScript (Fetch API)</h3>
                  <button
                    onClick={() => copyToClipboard(javascriptExample, 'javascript')}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {copiedItem === 'javascript' ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
                    {copiedItem === 'javascript' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{javascriptExample}</pre>
                </div>
              </div>

              {/* Python Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Python (requests)</h3>
                  <button
                    onClick={() => copyToClipboard(pythonExample, 'python')}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {copiedItem === 'python' ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
                    {copiedItem === 'python' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{pythonExample}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Notes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-yellow-500" />
              Implementation Notes
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>The logout endpoint invalidates the JWT token on the server side</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Always clear local tokens after successful logout</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Handle network errors gracefully - clear local tokens even if server logout fails</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>The endpoint may return an empty response body on success</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Refresh tokens are also invalidated during logout</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Testing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Testing</h2>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-blue-800 mb-2">
                <strong>Test the logout endpoint:</strong>
              </p>
              <p className="text-blue-700 text-sm">
                Use the Logout API Test Suite component to test the logout functionality with different scenarios including network errors, invalid tokens, and successful logout.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LogoutApiDocumentation;
