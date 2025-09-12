// routes/admin/index.js
import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import recipesRouter from "./recipes.js";
import mediaRouter from "./media.js";
import taxonomyRouter from "./taxonomy.js";
import commentsRouter from "./comments.js";
import reportsRouter from "./reports.js";
import usersRouter from "./users.js";
import settingsRouter from "./settings.js";
import metricsRouter from "./metrics.js";
import auditRouter from "./audit.js";
import * as ctrl from "../../controllers/admin/recipesController.js";
import * as metricsCtrl from "../../controllers/admin/metrics.controller.js";

const router = Router();

// Apply auth + admin role for all /api/admin/*
router.use(authenticate, requireAdmin);

// Health / probe route (does not expose sensitive info)
router.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Audit logs endpoint
router.get("/audit-logs", asyncHandler(ctrl.auditLogs));

// Activity feed endpoint
router.get("/activity", asyncHandler(metricsCtrl.getActivity));

// Placeholder sub-routers (can be replaced with real implementations)
function buildStub(name) {
  const r = Router();
  r.get("/", (req, res) => res.json({ section: name, items: [] }));
  r.get(
    "/_error",
    asyncHandler(async () => {
      const e = new Error("Demo error in " + name);
      e.status = 400;
      e.code = "DEMO_BAD_REQUEST";
      throw e;
    })
  );
  return r;
}

router.use("/recipes", recipesRouter);
router.use("/media", mediaRouter);
router.use("/taxonomy", taxonomyRouter);
router.use("/comments", commentsRouter);
router.use("/reports", reportsRouter);
router.use("/users", usersRouter);
router.use("/moderation", buildStub("moderation"));
router.use("/settings", settingsRouter);
router.use("/metrics", metricsRouter);
router.use("/audit-logs", auditRouter);

export default router;
