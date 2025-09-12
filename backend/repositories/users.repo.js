// repositories/users.repo.js
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import mongoose from "mongoose";

// List users with filtering and pagination
export async function listUsers(query = {}) {
  const { search, role, status, cursor, limit = 20, sort = "newest" } = query;

  // Build filter
  const filter = {};

  // Search by name or email
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by role
  if (role && ["admin", "user"].includes(role)) {
    filter.role = role;
  }

  // Filter by status (using isActive field)
  if (status) {
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "blocked") {
      filter.isActive = false;
    }
  }

  // Cursor pagination
  if (cursor) {
    try {
      const cursorDoc = await User.findById(cursor);
      if (cursorDoc) {
        if (sort === "oldest") {
          filter._id = { $gt: cursorDoc._id };
        } else {
          filter._id = { $lt: cursorDoc._id };
        }
      }
    } catch (err) {
      // Invalid cursor, ignore
    }
  }

  // Sort
  const sortField = sort === "oldest" ? "createdAt" : "createdAt";
  const sortDirection = sort === "oldest" ? 1 : -1;
  const sortQuery = { [sortField]: sortDirection, _id: sortDirection };

  // Query with pagination (fetch one extra to check hasNext)
  const items = await User.find(filter)
    .select(
      "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires"
    )
    .sort(sortQuery)
    .limit(Number(limit) + 1);

  const hasNext = items.length > Number(limit);
  if (hasNext) items.pop();

  return {
    items,
    hasNext,
    nextCursor:
      hasNext && items.length > 0 ? items[items.length - 1]._id : null,
  };
}

// Get single user with details
export async function getUser(id) {
  const user = await User.findById(id).select(
    "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires"
  );

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return user;
}

// Update user role
export async function updateUserRole(id, newRole, currentUser, req = null) {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Check if trying to modify own role
  if (
    user._id.toString() === currentUser._id.toString() ||
    user._id.toString() === currentUser.id?.toString()
  ) {
    // Check if this is the only admin
    if (user.role === "admin" && newRole === "user") {
      const adminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });
      if (adminCount <= 1) {
        const error = new Error(
          "Cannot remove admin role from the last active admin"
        );
        error.status = 403;
        error.code = "LAST_ADMIN_PROTECTION";
        throw error;
      }
    }
  }

  // Validate new role
  if (!["admin", "user"].includes(newRole)) {
    const error = new Error("Invalid role");
    error.status = 400;
    error.code = "INVALID_ROLE";
    throw error;
  }

  const originalRole = user.role;
  user.role = newRole;
  const updatedUser = await user.save();

  // Log audit
  await AuditLog.create({
    action: "update",
    entityType: "user",
    entityId: id,
    userId: currentUser._id || currentUser.id,
    userEmail: currentUser.email,
    userRole: currentUser.role,
    metadata: {
      operation: "update_user_role",
      originalRole,
      newRole,
      targetUserId: id,
      targetUserEmail: user.email,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return updatedUser;
}

// Update user status
export async function updateUserStatus(id, newStatus, currentUser, req = null) {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Check if trying to block own account
  if (
    user._id.toString() === currentUser._id.toString() ||
    user._id.toString() === currentUser.id?.toString()
  ) {
    const error = new Error("Cannot modify your own account status");
    error.status = 403;
    error.code = "SELF_STATUS_MODIFICATION_FORBIDDEN";
    throw error;
  }

  // Additional check: prevent blocking the last admin
  if (newStatus === "blocked" && user.role === "admin") {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      isActive: true,
      _id: { $ne: user._id },
    });
    if (activeAdminCount === 0) {
      const error = new Error("Cannot block the last active admin");
      error.status = 403;
      error.code = "LAST_ADMIN_PROTECTION";
      throw error;
    }
  }

  // Validate new status and convert to isActive
  let isActive;
  if (newStatus === "active") {
    isActive = true;
  } else if (newStatus === "blocked") {
    isActive = false;
  } else {
    const error = new Error("Invalid status");
    error.status = 400;
    error.code = "INVALID_STATUS";
    throw error;
  }

  const originalStatus = user.isActive ? "active" : "blocked";
  user.isActive = isActive;
  const updatedUser = await user.save();

  // Log audit
  await AuditLog.create({
    action: "update",
    entityType: "user",
    entityId: id,
    userId: currentUser._id || currentUser.id,
    userEmail: currentUser.email,
    userRole: currentUser.role,
    metadata: {
      operation: "update_user_status",
      originalStatus,
      newStatus,
      targetUserId: id,
      targetUserEmail: user.email,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return updatedUser;
}

// Get user statistics
export async function getUserStats() {
  const [totalUsers, activeUsers, blockedUsers, adminUsers, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: "admin", isActive: true }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

  return {
    total: totalUsers,
    active: activeUsers,
    blocked: blockedUsers,
    admins: adminUsers,
    users: activeUsers - adminUsers,
    recent: recentUsers,
  };
}

// Check if user is the last admin
export async function isLastAdmin(userId) {
  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    return false;
  }

  const adminCount = await User.countDocuments({
    role: "admin",
    isActive: true,
    _id: { $ne: userId },
  });

  return adminCount === 0;
}

export default {
  listUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  getUserStats,
  isLastAdmin,
};
