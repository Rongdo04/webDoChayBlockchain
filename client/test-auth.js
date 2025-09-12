// test-auth.js - Test authentication flow
import fetch from "node-fetch";

const BASE_URL = "http://localhost:8000";

async function testAuthFlow() {
  console.log("🧪 Testing Authentication Flow");
  console.log("================================");

  // Test 1: Call /api/auth/me without login (should fail)
  console.log("\n1. Testing /api/auth/me without login (should fail)...");
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log("✅ Expected: Got 401 unauthorized");
    } else {
      console.log("❌ Unexpected: Expected 401 but got", response.status);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }

  // Test 2: Try to login with a test account
  console.log("\n2. Testing login...");
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log("Login Status:", loginResponse.status);
    console.log("Login Response:", JSON.stringify(loginData, null, 2));

    if (loginResponse.status === 200) {
      console.log("✅ Login successful");

      // Extract cookies from response
      const cookies = loginResponse.headers.raw()["set-cookie"];
      console.log("Cookies received:", cookies);

      // Test 3: Call /api/auth/me with cookies
      console.log("\n3. Testing /api/auth/me with cookies...");

      // Create cookie string from set-cookie headers
      let cookieString = "";
      if (cookies) {
        cookieString = cookies.map((cookie) => cookie.split(";")[0]).join("; ");
      }
      console.log("Cookie string:", cookieString);

      const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieString,
        },
        credentials: "include",
      });

      const meData = await meResponse.json();
      console.log("Me Status:", meResponse.status);
      console.log("Me Response:", JSON.stringify(meData, null, 2));

      if (meResponse.status === 200) {
        console.log("✅ Authentication working correctly");
      } else {
        console.log("❌ Authentication failed after login");
      }
    } else if (loginResponse.status === 401) {
      console.log(
        "❌ Login failed - invalid credentials (expected if no admin user exists)"
      );
      console.log("💡 You might need to create an admin user first");
    } else {
      console.log("❌ Unexpected login response:", loginResponse.status);
    }
  } catch (error) {
    console.log("❌ Login error:", error.message);
  }

  console.log("\n🏁 Test completed");
}

// Run the test
testAuthFlow().catch(console.error);
