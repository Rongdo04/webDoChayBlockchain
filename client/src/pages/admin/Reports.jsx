// pages/admin/Reports.jsx
import React, { useState, useEffect } from "react";
import { useAdminApi } from "../../contexts/AdminApiContext";
import { toast } from "react-toastify";

const Reports = () => {
  const { getReports, updateReportStatus, deleteReport, getReportsStats } =
    useAdminApi();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());
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
      const response = await getReports(filters);
      setReports(response.items || []);
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
      const statsData = await getReportsStats();
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

      const updatedReport = await updateReportStatus(
        reportId,
        newStatus,
        notes
      );

      // Update local state
      setReports((prev) =>
        prev.map((report) => (report._id === reportId ? updatedReport : report))
      );

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
              {stats.total}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Chờ xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byStatus.pending}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">
              Đã giải quyết
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus.resolved}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Tuần này</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.recent}
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
                        {report.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "reviewed")
                              }
                              disabled={updating.has(report._id)}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              Xem
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "resolved")
                              }
                              disabled={updating.has(report._id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Giải quyết
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "rejected")
                              }
                              disabled={updating.has(report._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {report.status === "reviewed" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "resolved")
                              }
                              disabled={updating.has(report._id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Giải quyết
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "rejected")
                              }
                              disabled={updating.has(report._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </>
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
    </div>
  );
};

export default Reports;
