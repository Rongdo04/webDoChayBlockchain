// pages/admin/Reports.jsx
import React, { useState, useEffect } from "react";
import { useAdminApi } from "../contexts/AdminApiContext";
import { toast } from "react-toastify";

const Reports = () => {
  const { getReports, updateReportStatus, deleteReport, getReportsStats } =
    useAdminApi();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    targetType: "",
    search: "",
    page: 1,
  });

  // Status options
  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "reviewed", label: "Đã xem" },
    { value: "resolved", label: "Đã giải quyết" },
    { value: "rejected", label: "Từ chối" },
  ];

  // Target type options
  const typeOptions = [
    { value: "", label: "Tất cả loại" },
    { value: "recipe", label: "Công thức" },
    { value: "comment", label: "Bình luận" },
    { value: "post", label: "Bài viết" },
  ];

  // Status styles
  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      reviewed: "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Status labels
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xử lý",
      reviewed: "Đã xem",
      resolved: "Đã giải quyết",
      rejected: "Từ chối",
    };
    return labels[status] || status;
  };

  // Target type labels
  const getTypeLabel = (type) => {
    const labels = {
      recipe: "Công thức",
      comment: "Bình luận",
      post: "Bài viết",
    };
    return labels[type] || type;
  };

  // Load reports
  const loadReports = async () => {
    try {
      setLoading(true);
      console.log("Loading reports with filters:", filters);
      const response = await getReports(filters);
      console.log("Reports response:", response);
      setReports(response.data?.items || response.items || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Lỗi khi tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      console.log("Loading stats...");
      const response = await getReportsStats();
      console.log("Stats response:", response);
      const statsData = response.data || response;
      console.log("Stats data:", statsData);
      console.log("Stats byStatus:", statsData.byStatus);
      console.log("Pending count:", statsData.byStatus?.pending);
      console.log("Resolved count:", statsData.byStatus?.resolved);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Update report status
  const handleUpdateStatus = async (reportId, newStatus, notes = "") => {
    if (updating.has(reportId)) return;

    try {
      setUpdating((prev) => new Set(prev).add(reportId));

      const apiResponse = await updateReportStatus(
        reportId,
        newStatus,
        notes
      );

      console.log("Updated report from API:", apiResponse);

      // Extract the updated report data from API response
      const updatedReportData = apiResponse?.data?.data || apiResponse?.data || apiResponse;

      // Update local state with merged data
      setReports((prev) => {
        const newReports = prev.map((report) => {
          if (report._id === reportId || report.id === reportId) {
            // Merge old data with new data to preserve all fields
            const updatedReport = {
              ...report,
              ...updatedReportData,
              status: newStatus,
              _id: report._id || report.id,
              id: report.id || report._id,
            };
            console.log("Updated report in state:", updatedReport);
            return updatedReport;
          }
          return report;
        });
        return newReports;
      });

      // Update selectedReport if modal is open
      if (selectedReport && (selectedReport._id === reportId || selectedReport.id === reportId)) {
        setSelectedReport((prev) => ({
          ...prev,
          ...updatedReportData,
          status: newStatus,
        }));
      }

      toast.success("Cập nhật trạng thái thành công");

      // Reload stats
      loadStats();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  // View report details
  const handleView = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  // Delete report
  const handleDelete = async (reportId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) return;

    try {
      await deleteReport(reportId);
      setReports((prev) => prev.filter((report) => report._id !== reportId));
      toast.success("Xóa báo cáo thành công");
      loadStats();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Lỗi khi xóa báo cáo");
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filter changes
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load data on mount and filter changes
  useEffect(() => {
    loadReports();
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý báo cáo
        </h1>
        <p className="text-gray-600">Xem và xử lý các báo cáo từ người dùng</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Chờ xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byStatus?.pending || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">
              Đã giải quyết
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus?.resolved || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Tuần này</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.recent || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại nội dung
            </label>
            <select
              value={filters.targetType}
              onChange={(e) => handleFilterChange("targetType", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Tìm theo lý do hoặc mô tả..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có báo cáo nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người báo cáo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          {report.reporterId?.avatar ? (
                            <img
                              src={report.reporterId.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {report.reporterId?.name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {report.reporterId?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.reporterId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {getTypeLabel(report.targetType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {report.reason}
                      </div>
                      {report.description && (
                        <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                          {report.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                          report.status
                        )}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Xem
                        </button>
                        {report.status !== "resolved" && (
                          <button
                            onClick={() => handleUpdateStatus(report._id, "resolved")}
                            disabled={updating.has(report._id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Đánh dấu đã xử lý"
                          >
                            {updating.has(report._id) ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Đã xử lý
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chi tiết báo cáo
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Reporter Info */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Thông tin người báo cáo
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {selectedReport.reporterId?.avatar ? (
                      <img
                        src={selectedReport.reporterId.avatar}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {selectedReport.reporterId?.name?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedReport.reporterId?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedReport.reporterId?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Details */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Thông tin báo cáo
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Loại nội dung
                    </label>
                    <p className="text-sm text-gray-900">
                      {getTypeLabel(selectedReport.targetType)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trạng thái
                    </label>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                        selectedReport.status
                      )}`}
                    >
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ngày tạo
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Lý do báo cáo
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Mô tả chi tiết
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReport.adminNotes && (
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Ghi chú của admin
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedReport.adminNotes}
                  </p>
                </div>
              )}

              {/* Resolution Info */}
              {selectedReport.resolvedAt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Thông tin giải quyết
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày giải quyết
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(selectedReport.resolvedAt)}
                      </p>
                    </div>
                    {selectedReport.resolvedBy && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Người giải quyết
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedReport.resolvedBy.name || "Admin"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {selectedReport.status !== "resolved" && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedReport._id, "resolved");
                    handleCloseModal();
                  }}
                  disabled={updating.has(selectedReport._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating.has(selectedReport._id) ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Đánh dấu đã xử lý
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
