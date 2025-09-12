// test-metrics.js - Simple test for metrics endpoints
import fetch from "node-fetch";

const BASE_URL = "http://localhost:8000/api/admin";

// Test data - you'll need to login first to get a token
const adminCredentials = {
  email: "admin@test.com",
  password: "password123",
};

async function login() {
  try {
    const response = await fetch(`${BASE_URL}/../auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminCredentials),
    });

    const data = await response.json();
    if (data.success && data.token) {
      return data.token;
    }
    throw new Error("Login failed");
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

async function testMetricsOverview(token) {
  try {
    console.log("Testing GET /api/admin/metrics/overview...");
    const response = await fetch(`${BASE_URL}/metrics/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
    });

    const data = await response.json();
    console.log("Overview Response:", JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log("✅ Overview endpoint works!");
      console.log(`- Total recipes: ${data.data.totals.recipes}`);
      console.log(`- Pending reviews: ${data.data.totals.pendingReviews}`);
      console.log(`- New comments (7d): ${data.data.totals.newComments7d}`);
      console.log(`- Total users: ${data.data.totals.users}`);
      console.log(`- Timeseries data points: ${data.data.timeseries.length}`);
      return true;
    } else {
      console.log("❌ Overview endpoint failed:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Overview test error:", error);
    return false;
  }
}

async function testActivity(token) {
  try {
    console.log("\nTesting GET /api/admin/activity...");
    const response = await fetch(`${BASE_URL}/activity?limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
    });

    const data = await response.json();
    console.log("Activity Response:", JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log("✅ Activity endpoint works!");
      console.log(`- Activities returned: ${data.data.activities.length}`);
      return true;
    } else {
      console.log("❌ Activity endpoint failed:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Activity test error:", error);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting metrics endpoints test...\n");

  // Skip login for now, just test without auth to see basic response
  console.log("Testing endpoints without authentication first...\n");

  try {
    // Test overview without auth (should fail)
    console.log("Testing overview without auth (expecting 401)...");
    const response1 = await fetch(`${BASE_URL}/metrics/overview`);
    const data1 = await response1.json();
    console.log("Response:", response1.status, data1);

    // Test activity without auth (should fail)
    console.log("\nTesting activity without auth (expecting 401)...");
    const response2 = await fetch(`${BASE_URL}/activity`);
    const data2 = await response2.json();
    console.log("Response:", response2.status, data2);

    console.log("\n📊 Basic endpoint tests completed!");
    console.log(
      "Next step: Create admin user and test with proper authentication"
    );
  } catch (error) {
    console.error("Test error:", error);
  }
}

runTests();
