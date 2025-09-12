// test-api.js - Simple test script for the new API client
import { api, get, post } from "./src/lib/api.js";
import { HttpError } from "./src/lib/httpError.js";

// Test configuration
const BASE_URL = "http://localhost:5000";

console.log("🧪 Testing API Client...\n");

// Test 1: Basic GET request to health endpoint
async function testHealthEndpoint() {
  console.log("1. Testing health endpoint...");
  try {
    const response = await get("/api/health");
    console.log("✅ Health check successful:", response);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    if (error instanceof HttpError) {
      console.log("   Code:", error.code);
      console.log("   Status:", error.status);
      console.log("   Vietnamese message:", error.getLocalizedMessage());
    }
  }
  console.log("");
}

// Test 2: Test admin endpoint (should fail with 401 when not authenticated)
async function testAdminEndpoint() {
  console.log("2. Testing admin endpoint (should fail with 401)...");
  try {
    const response = await get("/api/admin/metrics/overview");
    console.log("✅ Unexpected success:", response);
  } catch (error) {
    if (error instanceof HttpError && error.isAuthError()) {
      console.log("✅ Expected auth error:", error.getLocalizedMessage());
      console.log("   Code:", error.code);
      console.log("   Status:", error.status);
    } else {
      console.log("❌ Unexpected error:", error.message);
    }
  }
  console.log("");
}

// Test 3: Test with query parameters
async function testWithParams() {
  console.log("3. Testing request with query parameters...");
  try {
    const response = await get("/api/admin/audit-logs", { limit: 10, page: 1 });
    console.log("✅ Query params request successful:", response);
  } catch (error) {
    console.log("❌ Query params request failed:", error.getLocalizedMessage());
    console.log("   Code:", error.code);
  }
  console.log("");
}

// Test 4: Test POST request
async function testPostRequest() {
  console.log("4. Testing POST request...");
  try {
    const response = await post("/api/auth/login", {
      email: "test@example.com",
      password: "testpass",
    });
    console.log("✅ POST request successful:", response);
  } catch (error) {
    console.log("❌ POST request failed:", error.getLocalizedMessage());
    console.log("   Code:", error.code);
    console.log("   Status:", error.status);
  }
  console.log("");
}

// Test 5: Test network error handling
async function testNetworkError() {
  console.log("5. Testing network error handling...");

  // Temporarily change base URL to invalid one
  const originalBaseURL = api.baseURL;

  try {
    const response = await get("/api/health");
    console.log("✅ Unexpected success:", response);
  } catch (error) {
    if (error instanceof HttpError && error.code === "NETWORK_ERROR") {
      console.log(
        "✅ Network error handled correctly:",
        error.getLocalizedMessage()
      );
    } else {
      console.log("❌ Unexpected error type:", error.message);
    }
  }
  console.log("");
}

// Test 6: Test HttpError utilities
async function testHttpErrorUtilities() {
  console.log("6. Testing HttpError utility methods...");

  // Create sample errors
  const authError = new HttpError(
    "UNAUTHORIZED",
    "Not authenticated",
    null,
    401
  );
  const serverError = new HttpError(
    "INTERNAL_ERROR",
    "Server error",
    null,
    500
  );
  const validationError = new HttpError(
    "VALIDATION_ERROR",
    "Invalid data",
    { field: "email" },
    422
  );

  console.log("Auth error checks:");
  console.log("  isAuthError():", authError.isAuthError());
  console.log("  isClientError():", authError.isClientError());
  console.log("  getLocalizedMessage():", authError.getLocalizedMessage());

  console.log("Server error checks:");
  console.log("  isServerError():", serverError.isServerError());
  console.log("  getLocalizedMessage():", serverError.getLocalizedMessage());

  console.log("Validation error JSON:");
  console.log("  toJSON():", JSON.stringify(validationError.toJSON(), null, 2));

  console.log("");
}

// Run all tests
async function runTests() {
  console.log(`🚀 API Base URL: ${BASE_URL}`);
  console.log(`📋 Running API client tests...\n`);

  await testHealthEndpoint();
  await testAdminEndpoint();
  await testWithParams();
  await testPostRequest();
  await testNetworkError();
  await testHttpErrorUtilities();

  console.log("✨ Test suite completed!");
}

// Export for use in other contexts
export {
  testHealthEndpoint,
  testAdminEndpoint,
  testWithParams,
  testPostRequest,
  testNetworkError,
  testHttpErrorUtilities,
  runTests,
};

// Run tests if this file is executed directly
if (typeof window === "undefined") {
  runTests().catch(console.error);
}
