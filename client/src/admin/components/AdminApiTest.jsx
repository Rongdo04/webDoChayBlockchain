import React, { useState } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import { APIErrorDisplay } from "../components/ErrorBoundary.jsx";

/**
 * AdminApiTest - Component test các admin API endpoints
 */
export default function AdminApiTest() {
  const {
    getMetricsOverview,
    getActivityFeed,
    getAuditLogs,
    safeApiCall,
    handleApiError,
  } = useAdminApi();

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const testEndpoint = async (name, apiCall, params = {}) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: null }));

    const result = await safeApiCall(apiCall, {
      defaultErrorMessage: `Lỗi khi test ${name}`,
    });

    if (result.success) {
      setResults((prev) => ({ ...prev, [name]: result.data }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: result.error }));
    }

    setLoading((prev) => ({ ...prev, [name]: false }));
  };

  const tests = [
    {
      name: "metricsOverview",
      label: "Metrics Overview",
      call: () => getMetricsOverview(),
      description: "Lấy tổng quan metrics dashboard",
    },
    {
      name: "activityFeed",
      label: "Activity Feed",
      call: () => getActivityFeed({ limit: 5 }),
      description: "Lấy 5 hoạt động gần đây",
    },
    {
      name: "auditLogs",
      label: "Audit Logs",
      call: () => getAuditLogs({ page: 1, limit: 5 }),
      description: "Lấy 5 audit logs đầu tiên",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Admin API Test Suite
        </h2>
        <p className="text-gray-600 mb-6">
          Test các endpoint admin để đảm bảo API client hoạt động đúng với
          authentication và role-based access.
        </p>

        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.name} className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{test.label}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                  <button
                    onClick={() => testEndpoint(test.name, test.call)}
                    disabled={loading[test.name]}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading[test.name] ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Testing...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                          />
                        </svg>
                        Test
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {loading[test.name] && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Đang gọi API...</span>
                  </div>
                )}

                {errors[test.name] && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-red-600 mt-0.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Error</h4>
                        <p className="text-red-800 text-sm mt-1">
                          {errors[test.name].message}
                        </p>
                        {errors[test.name].code && (
                          <p className="text-red-600 text-xs mt-1">
                            Code: {errors[test.name].code}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {results[test.name] &&
                  !loading[test.name] &&
                  !errors[test.name] && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-green-600 mt-0.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">
                            Success
                          </h4>
                          <details className="mt-2">
                            <summary className="text-sm text-green-800 cursor-pointer hover:text-green-900">
                              Xem response data
                            </summary>
                            <pre className="mt-2 p-3 bg-white border border-green-300 rounded text-xs overflow-auto max-h-40 text-gray-800">
                              {JSON.stringify(results[test.name], null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    </div>
                  )}

                {!loading[test.name] &&
                  !errors[test.name] &&
                  !results[test.name] && (
                    <p className="text-gray-500 text-sm">
                      Click "Test" để chạy endpoint này
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-blue-600 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Test Info</h4>
              <p className="text-blue-800 text-sm mt-1">
                Các test này sẽ gọi thực tế đến backend API. Nếu thấy lỗi 401
                (Unauthorized) hoặc 403 (Forbidden), điều đó chứng tỏ RBAC đang
                hoạt động đúng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
