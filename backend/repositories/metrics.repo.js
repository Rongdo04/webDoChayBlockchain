// repositories/metrics.repo.js
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import AuditLog from "../models/AuditLog.js";
import ViewLog from "../models/ViewLog.js";

/**
 * Get overview metrics for admin dashboard
 * @returns {Promise<Object>} Overview metrics with totals and timeseries data
 */
export async function getOverviewMetrics() {
  try {
    // Get current date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get totals
    const [totalRecipes, pendingReviews, newComments7d, totalUsers] =
      await Promise.all([
        Recipe.countDocuments(),
        // Count recipes waiting for review (pending status - user đã gửi, chờ admin duyệt)
        Recipe.countDocuments({ status: "pending" }),
        // Count all new comments in the last 7 days (not just pending)
        Comment.countDocuments({
          createdAt: { $gte: sevenDaysAgo },
        }),
        User.countDocuments(),
      ]);

    // Get timeseries data for the last 30 days
    const timeseries = await generateTimeseriesData(thirtyDaysAgo, now);

    return {
      totals: {
        recipes: totalRecipes,
        pendingReviews,
        newComments7d,
        users: totalUsers,
      },
      timeseries,
    };
  } catch (error) {
    console.error("Error getting overview metrics:", error);
    throw new Error("Failed to fetch overview metrics");
  }
}

/**
 * Generate timeseries data for metrics charts
 * @param {Date} startDate - Start date for timeseries
 * @param {Date} endDate - End date for timeseries
 * @returns {Promise<Array>} Array of daily metrics
 */
async function generateTimeseriesData(startDate, endDate) {
  try {
    // Generate date range
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get daily metrics for each date
    const timeseriesData = await Promise.all(
      dates.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const [recipeCount, commentCount, viewCount] = await Promise.all([
          Recipe.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
          Comment.countDocuments({
            createdAt: { $gte: date, $lt: nextDay },
          }),
          // Count views from ViewLog for this date
          ViewLog.countDocuments({
            viewedAt: { $gte: date, $lt: nextDay },
          }),
        ]);

        const dateStr = date.toISOString().split("T")[0];
        console.log(
          `📊 Metrics for ${dateStr}: views=${viewCount}, recipes=${recipeCount}, comments=${commentCount}`
        );

        return {
          date: dateStr, // YYYY-MM-DD format
          views: viewCount, // Real views data from ViewLog
          recipes: recipeCount,
          comments: commentCount,
        };
      })
    );

    return timeseriesData;
  } catch (error) {
    console.error("Error generating timeseries data:", error);
    throw new Error("Failed to generate timeseries data");
  }
}

/**
 * Get recent activity feed from audit logs
 * @param {number} limit - Number of activities to return
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Array>} Array of recent activities
 */
export async function getRecentActivity(limit = 20, days = 7) {
  try {
    // Calculate date threshold
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const activities = await AuditLog.find({
      createdAt: { $gte: daysAgo },
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform audit logs to activity feed format
    return activities.map((activity) => ({
      id: activity._id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      user: {
        id: activity.userId?._id,
        name: activity.userId?.name || "Unknown User",
        email: activity.userId?.email,
      },
      description: generateActivityDescription(activity),
      timestamp: activity.createdAt,
      metadata: activity.metadata,
    }));
  } catch (error) {
    console.error("Error getting recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
}

/**
 * Generate human-readable description for activity
 * @param {Object} activity - Audit log entry
 * @returns {string} Human-readable description
 */
function generateActivityDescription(activity) {
  const { action, entityType, userEmail } = activity;
  const userName = activity.userId?.name || userEmail || "Unknown User";

  const actionMap = {
    create: "created",
    update: "updated",
    delete: "deleted",
    publish: "published",
    unpublish: "unpublished",
    reject: "rejected",
  };

  const entityMap = {
    recipe: "recipe",
    user: "user",
    settings: "system settings",
    system: "system",
  };

  const actionText = actionMap[action] || action;
  const entityText = entityMap[entityType] || entityType;

  return `${userName} ${actionText} ${entityText}`;
}

/**
 * Get metrics summary for specific date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Metrics summary
 */
export async function getMetricsSummary(startDate, endDate) {
  try {
    const [recipesCreated, commentsCreated, usersRegistered, activitiesCount] =
      await Promise.all([
        Recipe.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        }),
        Comment.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        }),
        User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        }),
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        }),
      ]);

    return {
      period: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      summary: {
        recipesCreated,
        commentsCreated,
        usersRegistered,
        activitiesCount,
      },
    };
  } catch (error) {
    console.error("Error getting metrics summary:", error);
    throw new Error("Failed to fetch metrics summary");
  }
}
