// src/components/ApiTest.jsx - Test component for API client
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { api, get, post } from "../lib/api.js";
import { HttpError } from "../lib/httpError.js";

const ApiTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setResults((prev) => [
      ...prev,
      {
        test,
        success,
        data,
        error,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Health endpoint
  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await get("/api/health");
      addResult("Health Check", true, response);
    } catch (error) {
      addResult("Health Check", false, null, error);
    }
    setLoading(false);
  };

  // Test 2: Admin metrics (should fail with 401)
  const testAdminMetrics = async () => {
    setLoading(true);
    try {
      const response = await get("/api/admin/metrics/overview");
      addResult("Admin Metrics", true, response);
    } catch (error) {
      addResult("Admin Metrics", false, null, error);
    }
    setLoading(false);
  };

  // Test 3: Query parameters
  const testWithParams = async () => {
    setLoading(true);
    try {
      const response = await get("/api/admin/audit-logs", { limit: 5 });
      addResult("Query Params", true, response);
    } catch (error) {
      addResult("Query Params", false, null, error);
    }
    setLoading(false);
  };

  // Test 4: POST request
  const testPost = async () => {
    setLoading(true);
    try {
      const response = await post("/api/auth/login", {
        email: "demo@example.com",
        password: "demo123",
      });
      addResult("POST Request", true, response);
    } catch (error) {
      addResult("POST Request", false, null, error);
    }
    setLoading(false);
  };

  // Run all tests
  const runAllTests = async () => {
    clearResults();
    await testHealth();
    await testAdminMetrics();
    await testWithParams();
    await testPost();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          API Client Test Suite
        </h2>
        <p className="text-gray-600">
          Test the standardized API client with Vietnamese error messages
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testHealth}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Health
          </button>
          <button
            onClick={testAdminMetrics}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test Admin (401)
          </button>
          <button
            onClick={testWithParams}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Query Params
          </button>
          <button
            onClick={testPost}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test POST
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Running Tests..." : "Run All Tests"}
          </button>
          <button
            onClick={clearResults}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* API Configuration Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Base URL:</strong>{" "}
            {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}
          </div>
          <div>
            <strong>Use Mock:</strong>{" "}
            {import.meta.env.VITE_USE_MOCK || "false"}
          </div>
          <div>
            <strong>Timeout:</strong>{" "}
            {import.meta.env.VITE_API_TIMEOUT || "10000"}ms
          </div>
          <div>
            <strong>Credentials:</strong> include (cookies)
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>

        {results.length === 0 && (
          <p className="text-gray-500 italic">
            No tests run yet. Click a test button to start.
          </p>
        )}

        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              result.success
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4
                className={`font-semibold ${
                  result.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {result.success ? <FaCheckCircle className="inline mr-1 text-green-500" /> : <FaTimesCircle className="inline mr-1 text-red-500" />} {result.test}
              </h4>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>

            {result.success ? (
              <div className="space-y-2">
                <p className="text-green-700">Request successful</p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-green-600 hover:text-green-800">
                    Show response data
                  </summary>
                  <pre className="mt-2 p-2 bg-green-100 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-700">
                  <strong>Error:</strong>{" "}
                  {result.error?.getLocalizedMessage?.() ||
                    result.error?.message}
                </p>
                {result.error instanceof HttpError && (
                  <div className="text-sm text-red-600 space-y-1">
                    <p>
                      <strong>Code:</strong> {result.error.code}
                    </p>
                    {result.error.status && (
                      <p>
                        <strong>Status:</strong> {result.error.status}
                      </p>
                    )}
                    {result.error.details && (
                      <details>
                        <summary className="cursor-pointer hover:text-red-800">
                          Show error details
                        </summary>
                        <pre className="mt-1 p-2 bg-red-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.error.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Usage Examples */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Usage Examples</h3>
        <pre className="text-sm text-blue-700 overflow-x-auto">
          {`// Import the API client
import { api, get, post, put, del } from './lib/api.js';
import { HttpError } from './lib/httpError.js';

// GET with query parameters
const data = await get('/api/admin/metrics/overview');

// POST with body
const result = await post('/api/auth/login', { email, password });

// Error handling
try {
  const response = await get('/api/admin/settings');
} catch (error) {
  if (error instanceof HttpError) {
    console.log(error.getLocalizedMessage()); // Vietnamese message
    if (error.isAuthError()) {
      // Handle authentication error
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default ApiTest;
