/** TaxonomyList with API Integration
 * Props: { type: 'categories' | 'tags' }
 * Features: list, search (debounced), add, inline edit, delete with confirm, duplicate validation with API.
 * Handles 409 duplicate errors and shows appropriate messages.
 */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import Toast from "./Toast.jsx";
import Pagination from "./Pagination.jsx";
import { t } from "../../i18n";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TaxonomyList({ type }) {
  const adminApi = useAdminApi();
  const labelSingular =
    type === "categories"
      ? t("taxonomy.category", "Category")
      : t("taxonomy.tag", "Tag");

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, msg: "", type: "info" });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  // API functions based on type
  const apiCall = useMemo(() => {
    if (type === "categories") {
      return {
        list: adminApi.getCategories,
        create: adminApi.createCategory,
        update: adminApi.updateCategory,
        delete: adminApi.deleteCategory,
      };
    } else {
      return {
        list: adminApi.getTags,
        create: adminApi.createTag,
        update: adminApi.updateTag,
        delete: adminApi.deleteTag,
      };
    }
  }, [type, adminApi]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Load items
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (debounced.trim()) {
        params.search = debounced.trim();
      }

      const result = await adminApi.safeApiCall(() => apiCall.list(params), {
        defaultErrorMessage: `Không thể tải ${labelSingular.toLowerCase()}`,
      });

      if (result.success) {
        // Handle new paginated response format
        const responseData = result.data?.data || result.data || {};
        const items = responseData.items || responseData || [];
        setItems(Array.isArray(items) ? items : []);

        // Update pagination info
        if (responseData.pageInfo) {
          setPagination((prev) => ({
            ...prev,
            total: responseData.total || 0,
            hasNext: responseData.pageInfo.hasNext || false,
            hasPrev: responseData.pageInfo.hasPrev || false,
          }));
        }
      } else {
        showToast(
          result.error?.message ||
            `Không thể tải ${labelSingular.toLowerCase()}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      showToast(`Không thể tải ${labelSingular.toLowerCase()}`, "error");
    } finally {
      setLoading(false);
    }
  }, [
    debounced,
    apiCall.list,
    adminApi,
    labelSingular,
    pagination.page,
    pagination.limit,
  ]);

  // Load items on mount and when search changes
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debounced !== query) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debounced, query]);

  // Helper functions
  const showToast = (msg, type = "info") => {
    setToast({ open: true, msg, type });
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const existingNames = useMemo(
    () => items.map((i) => i.name.toLowerCase()),
    [items]
  );

  const duplicateNew =
    newName.trim() && existingNames.includes(newName.trim().toLowerCase());

  const duplicateEdit =
    editId &&
    editName.trim() &&
    existingNames
      .filter(
        (n) => n !== items.find((i) => i._id === editId)?.name.toLowerCase()
      )
      .includes(editName.trim().toLowerCase());

  // CRUD operations
  const addItem = async () => {
    if (!newName.trim() || duplicateNew) return;

    const result = await adminApi.safeApiCall(
      () =>
        apiCall.create({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      { defaultErrorMessage: `Không thể tạo ${labelSingular.toLowerCase()}` }
    );

    if (result.success) {
      setNewName("");
      setNewDescription("");
      setAdding(false);
      showToast(`${labelSingular} đã được thêm`, "success");
      loadItems(); // Reload list
    } else {
      // Handle duplicate error (409)
      if (result.error?.status === 409) {
        showToast("Tên đã tồn tại", "error");
      } else {
        showToast(
          result.error?.message ||
            `Không thể tạo ${labelSingular.toLowerCase()}`,
          "error"
        );
      }
    }
  };

  const startEdit = (id) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    setEditId(id);
    setEditName(item.name);
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!editName.trim() || duplicateEdit) return;

    const result = await adminApi.safeApiCall(
      () =>
        apiCall.update(editId, {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      {
        defaultErrorMessage: `Không thể cập nhật ${labelSingular.toLowerCase()}`,
      }
    );

    if (result.success) {
      cancelEdit();
      showToast(`${labelSingular} đã được cập nhật`, "success");
      loadItems(); // Reload list
    } else {
      // Handle duplicate error (409)
      if (result.error?.status === 409) {
        showToast("Tên đã tồn tại", "error");
      } else {
        showToast(
          result.error?.message ||
            `Không thể cập nhật ${labelSingular.toLowerCase()}`,
          "error"
        );
      }
    }
  };

  const askDelete = (id) => setConfirm({ open: true, id });

  const doDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });

    const result = await adminApi.safeApiCall(() => apiCall.delete(id), {
      defaultErrorMessage: `Không thể xóa ${labelSingular.toLowerCase()}`,
    });

    if (result.success) {
      showToast(`${labelSingular} đã được xóa`, "success");

      // If this was the last item on current page and not page 1, go to previous page
      if (items.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        loadItems(); // Reload list
      }
    } else {
      showToast(
        result.error?.message || `Không thể xóa ${labelSingular.toLowerCase()}`,
        "error"
      );
    }
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="search"
            placeholder={
              type === "categories"
                ? t("taxonomy.searchCategory", "Search category...")
                : t("taxonomy.searchTag", "Search tag...")
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input w-full sm:w-60"
            aria-label={t("common.search") + " " + labelSingular}
          />
        </div>
        {!adding && (
          <button className="btn-brand" onClick={() => setAdding(true)}>
            {type === "categories"
              ? t("taxonomy.addCategory", "Add category")
              : t("taxonomy.addTag", "Add tag")}
          </button>
        )}
      </div>

      {adding && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-900/15 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input"
              placeholder={labelSingular + " " + t("common.name", "name")}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !duplicateNew && newName.trim()) {
                  addItem();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                  setNewDescription("");
                }
              }}
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="input resize-none"
              placeholder={
                t("common.description", "Mô tả") +
                " (" +
                t("common.optional", "tùy chọn") +
                ")"
              }
              rows={2}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  e.ctrlKey &&
                  !duplicateNew &&
                  newName.trim()
                ) {
                  addItem();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                  setNewDescription("");
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addItem}
              disabled={!newName.trim() || duplicateNew}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              {t("actions.save", "Save")}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewName("");
                setNewDescription("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              {t("actions.cancel")}
            </button>
          </div>
          {duplicateNew && (
            <p className="text-xs text-rose-600">
              {t("taxonomy.duplicateNotAllowed", "Tên đã tồn tại")}
            </p>
          )}
        </div>
      )}

      {/* Results info */}
      {!loading && pagination.total > 0 && (
        <div className="text-xs text-emerald-800/70 mb-4">
          Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} trong
          tổng số {pagination.total} {labelSingular.toLowerCase()}
          {debounced.trim() && ` cho "${debounced}"`}
        </div>
      )}

      <div className="border border-emerald-900/15 rounded-xl overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-emerald-600">
            <div className="text-sm">Đang tải...</div>
          </div>
        ) : (
          <table
            className="w-full text-sm"
            role="table"
            aria-label={`${labelSingular} table`}
          >
            <thead className="bg-emerald-950/90 text-emerald-50 text-left">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                  {t("common.name", "Name")}
                </th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                  {t("common.slug", "Slug")}
                </th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                  {t("common.description", "Description")}
                </th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                  <span title="Số lần được sử dụng trong công thức">
                    {t("common.usage", "Usage")}
                  </span>
                </th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide w-32">
                  {t("table.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const editing = editId === item._id;
                return (
                  <React.Fragment key={item._id}>
                    <tr className="border-b last:border-b-0 border-emerald-900/10 hover:bg-emerald-50/60">
                      <td className="px-4 py-2 align-middle">
                        <span className="text-emerald-900/90 font-medium">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-middle text-xs text-emerald-800/70">
                        {item.slug}
                      </td>
                      <td className="px-4 py-2 align-middle text-xs text-emerald-800/70 max-w-xs">
                        <div className="truncate" title={item.description}>
                          {item.description ||
                            t("common.noDescription", "Không có mô tả")}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-middle text-xs text-emerald-800/70">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium"
                          title={`Được sử dụng trong ${
                            item.usageCount || 0
                          } công thức`}
                        >
                          {item.usageCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-900/10 text-emerald-900 text-xs font-medium hover:bg-emerald-900/20"
                          >
                            {t("actions.edit")}
                          </button>
                          <button
                            onClick={() => askDelete(item._id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
                          >
                            {t("actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {editing && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 bg-emerald-50/30">
                          <div className="flex flex-col gap-3">
                            <div className="text-sm font-medium text-emerald-900">
                              {t("actions.edit")} {labelSingular}
                            </div>
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block text-xs font-medium text-emerald-800 mb-1">
                                  {t("common.name", "Tên")}
                                </label>
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="input text-sm w-full"
                                  placeholder={
                                    labelSingular +
                                    " " +
                                    t("common.name", "name")
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      !duplicateEdit &&
                                      editName.trim()
                                    ) {
                                      saveEdit();
                                    }
                                    if (e.key === "Escape") {
                                      cancelEdit();
                                    }
                                  }}
                                />
                                {duplicateEdit && (
                                  <div className="text-xs text-rose-600 mt-1">
                                    {t(
                                      "validation.duplicateName",
                                      "Tên đã tồn tại"
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-emerald-800 mb-1">
                                  {t("common.description", "Mô tả")} (
                                  {t("common.optional", "tùy chọn")})
                                </label>
                                <textarea
                                  value={editDescription}
                                  onChange={(e) =>
                                    setEditDescription(e.target.value)
                                  }
                                  className="input text-sm w-full resize-none"
                                  placeholder={t("common.description", "Mô tả")}
                                  rows={2}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.ctrlKey &&
                                      !duplicateEdit &&
                                      editName.trim()
                                    ) {
                                      saveEdit();
                                    }
                                    if (e.key === "Escape") {
                                      cancelEdit();
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                disabled={!editName.trim() || duplicateEdit}
                                className="px-4 py-2 rounded-lg bg-emerald-900 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-40"
                              >
                                {t("actions.save", "Save")}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                              >
                                {t("actions.cancel")}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredItems.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-emerald-800/70"
                  >
                    {debounced.trim()
                      ? t("common.noSearchResults", "Không tìm thấy kết quả")
                      : t("common.noItems", "Không có mục nào")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(pagination.total / pagination.limit)}
            onPageChange={handlePageChange}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            total={pagination.total}
          />
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        title={t("actions.delete") + " " + labelSingular}
        message={t(
          "taxonomy.deleteMessage",
          "Bạn có chắc chắn muốn xóa mục này không?"
        )}
        confirmLabel={t("actions.delete")}
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.msg}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}
