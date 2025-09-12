// controllers/admin/users.controller.js
import * as usersRepo from "../../repositories/users.repo.js";

// GET /api/admin/users - List users with filtering and pagination
export async function listUsers(req, res) {
  try {
    const result = await usersRepo.listUsers(req.query);

    res.json({
      success: true,
      data: {
        items: result.items,
        pagination: {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
        },
      },
    });
  } catch (error) {
    console.error("List users error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/admin/users/:id - Get single user details
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await usersRepo.getUser(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// PUT /api/admin/users/:id/role - Update user role
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await usersRepo.updateUserRole(id, role, req.user, req);

    res.json({
      success: true,
      data: updatedUser,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Update user role error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// PUT /api/admin/users/:id/status - Update user status
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedUser = await usersRepo.updateUserStatus(
      id,
      status,
      req.user,
      req
    );

    res.json({
      success: true,
      data: updatedUser,
      message: `User status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/admin/users/stats - Get user statistics
export async function getUserStats(req, res) {
  try {
    const stats = await usersRepo.getUserStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

export default {
  listUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  getUserStats,
};
