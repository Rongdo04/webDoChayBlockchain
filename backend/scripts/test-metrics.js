// scripts/test-metrics.js
import fetch from "node-fetch";

const BASE_URL = "http://localhost:8000/api/admin";

// Sample admin credentials for testing
const testCredentials = {
  email: "admin@test.com",
  password: "password123",
};

// Function to login and get auth cookie
async function login() {
  try {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCredentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    // Extract cookie from response headers
    const cookies = response.headers.get("set-cookie");
    return cookies;
  } catch (error) {
    console.error("Login error:", error.message);
    return null;
  }
}

// Function to test metrics overview endpoint
async function testOverview(cookies) {
  try {
    console.log("\n🔍 Testing GET /api/admin/metrics/overview...");

    const response = await fetch(`${BASE_URL}/metrics/overview`, {
      headers: {
        Cookie: cookies || "",
      },
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success!");
      console.log("Response shape:", {
        success: data.success,
        totals: Object.keys(data.data?.totals || {}),
        timeseriesLength: data.data?.timeseries?.length || 0,
        sampleTimeseries: data.data?.timeseries?.slice(0, 2),
      });
    } else {
      const error = await response.text();
      console.log("❌ Failed:", error);
    }
  } catch (error) {
    console.error("❌ Error testing overview:", error.message);
  }
}

// Function to test activity endpoint
async function testActivity(cookies) {
  try {
    console.log("\n🔍 Testing GET /api/admin/activity...");

    const response = await fetch(`${BASE_URL}/activity?limit=5`, {
      headers: {
        Cookie: cookies || "",
      },
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success!");
      console.log("Response shape:", {
        success: data.success,
        total: data.data?.total,
        limit: data.data?.limit,
        activitiesCount: data.data?.activities?.length || 0,
        sampleActivity: data.data?.activities?.[0],
      });
    } else {
      const error = await response.text();
      console.log("❌ Failed:", error);
    }
  } catch (error) {
    console.error("❌ Error testing activity:", error.message);
  }
}

// Function to test without authentication
async function testWithoutAuth() {
  try {
    console.log("\n🔍 Testing endpoints without authentication...");

    const response = await fetch(`${BASE_URL}/metrics/overview`);
    console.log(`Overview without auth - Status: ${response.status}`);

    const response2 = await fetch(`${BASE_URL}/activity`);
    console.log(`Activity without auth - Status: ${response2.status}`);

    if (response.status === 401 && response2.status === 401) {
      console.log("✅ Properly rejecting unauthenticated requests");
    }
  } catch (error) {
    console.error("❌ Error testing without auth:", error.message);
  }
}

// Main test function
async function runTests() {
  console.log("🧪 Testing Admin Metrics API");
  console.log("================================");

  // Test without authentication first
  await testWithoutAuth();

  // Try to login (may fail if no test data exists)
  console.log("\n🔐 Attempting login...");
  const cookies = await login();

  if (cookies) {
    console.log("✅ Login successful");
    await testOverview(cookies);
    await testActivity(cookies);
  } else {
    console.log("❌ Login failed - testing endpoints without auth only");
    // Test endpoints anyway to check structure
    await testOverview();
    await testActivity();
  }

  console.log("\n✨ Test complete!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export default runTests;
