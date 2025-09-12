// src/lib/api.js - Standardized HTTP client with cookie/session support
// ------------------------------------------------------------------
// This file cleans up merge leftovers, fixes dangling references, and
// unifies real API calls vs. mock fallbacks under a single config flag.

import { HttpError } from "./httpError.js";

// Configuration
const config = {
  baseURL: (
    import.meta?.env?.VITE_API_BASE_URL ?? "http://localhost:8000"
  ).replace(/\/$/, ""),
  timeout: Number(import.meta?.env?.VITE_API_TIMEOUT ?? 10000),
  useMock: String(import.meta?.env?.VITE_USE_MOCK ?? "false") === "true",
};

/**
 * Build query string from parameters object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (typeof value === "object") {
        // Flatten simple objects as JSON strings (server should parse)
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * Handle authentication errors with redirect
 * @param {HttpError} error - The HTTP error
 */
const handleAuthError = (error) => {
  try {
    if (typeof window !== "undefined" && error?.isAuthError?.()) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );

      // Redirect to login with return URL for both admin and user routes
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = `/auth/login?redirect=${returnUrl}`;
      } else {
        // For user routes, also redirect to login
        window.location.href = `/auth/login?redirect=${returnUrl}`;
      }
    }
  } catch {}
};

/**
 * Core fetch wrapper with standardized error handling
 * @param {string} path - API endpoint path (should start with "/" e.g., "/api/recipes")
 * @param {Object} options - Request options
 * @returns {Promise<any>} Response data
 */
const request = async (path, options = {}) => {
  // Short-circuit when in mock mode so we never hit the network unintentionally
  if (config.useMock) {
    throw new HttpError("MOCK_MODE", "API client is in mock mode", {
      path,
      options,
    });
  }

  const {
    method = "GET",
    body = null,
    params = null,
    headers = {},
    timeout = config.timeout,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  // Build full URL (avoid duplicate slashes)
  const queryString = params ? buildQueryString(params) : "";
  const url = `${config.baseURL}${path}${queryString}`;

  // Prepare request headers
  const requestHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  };

  // Prepare request options
  const controller = new AbortController();
  const signals = [];
  if (externalSignal) signals.push(externalSignal);
  signals.push(controller.signal);
  const compositeSignal = mergeAbortSignals(signals);

  const requestOptions = {
    method,
    headers: requestHeaders,
    credentials: "include", // Include cookies for session management
    signal: compositeSignal,
    ...fetchOptions,
  };

  // Add body for non-GET requests
  if (body && method !== "GET") {
    if (body instanceof FormData) {
      // Let browser set the multipart boundary automatically
      delete requestHeaders["Content-Type"];
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  // Enforce timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, requestOptions);

    // Handle non-ok responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        throw new HttpError(
          "HTTP_ERROR",
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, statusText: response.statusText },
          response.status
        );
      }

      const httpError =
        HttpError.fromApiResponse?.(errorData, response.status) ??
        new HttpError(
          "HTTP_ERROR",
          errorData?.message || "HTTP error",
          errorData,
          response.status
        );

      handleAuthError(httpError);
      throw httpError;
    }

    // Parse successful response
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (parseError) {
        throw HttpError.parseError(parseError.message);
      }
    }

    // Fallback to text for non-JSON responses
    return await response.text();
  } catch (error) {
    // Map common fetch/abort errors
    if (error?.name === "AbortError") {
      throw HttpError.timeoutError("Request timed out");
    }

    if (error instanceof HttpError) throw error;

    if (
      error?.name === "TypeError" &&
      `${error.message}`.toLowerCase().includes("fetch")
    ) {
      throw HttpError.networkError(error.message);
    }

    // Re-throw unexpected errors
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Merge multiple AbortSignals into a single signal
 * If any source signal aborts, the merged signal aborts.
 */
function mergeAbortSignals(signals = []) {
  if (!signals.length) return undefined;
  const controller = new AbortController();

  const onAbort = () => controller.abort();
  signals.forEach((sig) => {
    if (!sig) return;
    if (sig.aborted) controller.abort();
    else sig.addEventListener("abort", onAbort, { once: true });
  });

  return controller.signal;
}

/**
 * HTTP client API
 */
export const api = {
  /** GET */
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  /** POST */
  post: (path, options = {}) => request(path, { ...options, method: "POST" }),
  /** PUT */
  put: (path, options = {}) => request(path, { ...options, method: "PUT" }),
  /** DELETE */
  delete: (path, options = {}) =>
    request(path, { ...options, method: "DELETE" }),
  /** PATCH */
  patch: (path, options = {}) => request(path, { ...options, method: "PATCH" }),
};

/** Convenience wrappers */
export const get = (path, params = {}, options = {}) =>
  api.get(path, { ...options, params });
export const post = (path, body = {}, options = {}) =>
  api.post(path, { ...options, body });
export const put = (path, body = {}, options = {}) =>
  api.put(path, { ...options, body });
export const del = (path, options = {}) => api.delete(path, options);

// ------------------------------------------------------------------
// Mock data fallbacks (backward compatibility)
// ------------------------------------------------------------------
import { recipes, comments, users } from "../data/mock.js";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/** Sort helpers tolerant to legacy fields */
const getRating = (r) => Number(r?.ratingAvg ?? r?.rating ?? 0);
const getTotalTime = (r) =>
  Number(r?.durationPrep ?? 0) + Number(r?.durationCook ?? 0);

/**
 * Fetch paginated recipes (search, filter, sort)
 */
export async function fetchRecipes({
  search,
  filters,
  sort,
  page = 1,
  pageSize = 12,
} = {}) {
  if (!config.useMock) {
    return get("/api/recipes", {
      search,
      ...filters,
      sort,
      page,
      pageSize,
    });
  }

  // Mock mode
  await delay();
  let data = [...recipes];

  // Search
  if (search) {
    const s = String(search).toLowerCase();
    data = data.filter(
      (r) =>
        r.title?.toLowerCase?.().includes(s) ||
        r.description?.toLowerCase?.().includes(s) ||
        (Array.isArray(r.tasteTags) &&
          r.tasteTags.some((t) => String(t).toLowerCase().includes(s))) ||
        (Array.isArray(r.ingredients) &&
          r.ingredients.some((i) => String(i).toLowerCase().includes(s)))
    );
  }

  // Filters
  if (filters) {
    const { category, dietType, difficulty, tasteTags, maxPrep } = filters;
    if (Array.isArray(category) && category.length)
      data = data.filter((r) => category.includes(r.category));
    if (Array.isArray(dietType) && dietType.length)
      data = data.filter((r) => dietType.includes(r.dietType));
    if (Array.isArray(difficulty) && difficulty.length)
      data = data.filter((r) => difficulty.includes(r.difficulty));
    if (Array.isArray(tasteTags) && tasteTags.length)
      data = data.filter(
        (r) =>
          Array.isArray(r.tasteTags) &&
          r.tasteTags.some((t) => tasteTags.includes(t))
      );
    if (maxPrep)
      data = data.filter((r) => Number(r.durationPrep ?? 0) <= Number(maxPrep));
  }

  // Sort
  if (sort) {
    data.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
        case "popular":
          return Number(b.likes ?? 0) - Number(a.likes ?? 0);
        case "rating":
          return getRating(b) - getRating(a);
        case "time":
          return getTotalTime(a) - getTotalTime(b);
        default:
          return 0;
      }
    });
  }

  const total = data.length;
  const start = (page - 1) * pageSize;
  const items = data.slice(start, start + pageSize);

  return {
    data: items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

/** Fetch one recipe by ID (numeric or string id) */
export async function fetchRecipeById(id) {
  if (!config.useMock) {
    return get(`/api/recipes/${id}`);
  }
  await delay();
  const recipe = recipes.find((r) => String(r.id) === String(id));
  if (!recipe) throw new Error("Recipe not found");
  return recipe;
}

/** Fetch one recipe by slug */
export async function fetchRecipe(slug) {
  if (!config.useMock) {
    return get(`/api/recipes/slug/${encodeURIComponent(slug)}`);
  }
  await delay(300);
  return recipes.find((r) => r.slug === slug) || null;
}

/** Comments */
export async function fetchComments(recipeId) {
  if (!config.useMock) {
    return get(`/api/recipes/${recipeId}/comments`);
  }
  await delay(200);
  return comments
    .filter((c) => String(c.recipeId) === String(recipeId))
    .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
    .map((c) => ({
      ...c,
      user: users.find((u) => String(u.id) === String(c.userId)),
    }));
}

export async function addComment(recipeId, userId, content) {
  if (!config.useMock) {
    return post(`/api/recipes/${recipeId}/comments`, { userId, content });
  }
  const newC = {
    id: "c" + Date.now(),
    recipeId,
    userId,
    content,
    createdAt: Date.now(),
  };
  comments.push(newC);
  return { ...newC, user: users.find((u) => String(u.id) === String(userId)) };
}

/** Global search across recipes, ingredients, and tags */
export async function globalSearch(q) {
  if (!config.useMock) {
    return get("/api/search", { q });
  }
  await delay(350);
  const s = String(q ?? "").toLowerCase();

  const recipeMatches = recipes.filter(
    (r) =>
      r.title?.toLowerCase?.().includes(s) ||
      (Array.isArray(r.tasteTags) &&
        r.tasteTags.some((t) => String(t).toLowerCase().includes(s)))
  );

  const tagSet = new Set();
  recipeMatches.forEach((r) =>
    Array.isArray(r.tasteTags)
      ? r.tasteTags.forEach((t) => tagSet.add(t))
      : null
  );

  const ingredientMatches = recipes
    .flatMap((r) => (Array.isArray(r.ingredients) ? r.ingredients : []))
    .filter((i) => String(i).toLowerCase().includes(s));

  return {
    recipes: recipeMatches.slice(0, 8),
    ingredients: [...new Set(ingredientMatches)].slice(0, 8),
    tags: [...tagSet].slice(0, 8),
  };
}

// For consumers that still import these directly
export { users, recipes };

export default api;
