import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9999/api",
  timeout: 120000, // 120s (2 phút) để hỗ trợ Render.com cold start và dữ liệu lớn
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    // Public endpoints that don't require authentication
    const publicEndpoints = [
      "/auth/login",
      "/auth/forgot-password",
      "/rooms",
      "/roomtypes",
      "/floors",
      "/buildings",
      "/deposits",
      "/booking-requests",
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    const token = localStorage.getItem("token");
    if (token) {
      // Trim token to remove any whitespace
      const cleanToken = token.trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;

      // Debug log for /auth/me requests
      if (config.url?.includes("/auth/me")) {
        console.log("API Request to /auth/me:", {
          hasToken: !!cleanToken,
          tokenLength: cleanToken.length,
          tokenPreview: cleanToken.substring(0, 30) + "...",
          headerSet: !!config.headers.Authorization,
        });
      }
    } else {
      // Only warn for non-public endpoints
      if (!isPublicEndpoint) {
        console.warn("No token found in localStorage for request:", config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Phân biệt network error (không có response) vs HTTP error (có response)
    if (!error.response) {
      // Network error: CORS bị chặn, server offline, timeout, DNS fail...
      console.error("API Network Error:", {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,           // Hiển thị "Network Error", "timeout of 30000ms exceeded", v.v.
        code: error.code,                 // "ERR_NETWORK", "ECONNABORTED", v.v.
        baseURL: error.config?.baseURL,
        hint: "Có thể backend đang cold start (Render free tier), CORS bị chặn, hoặc mất kết nối",
      });
    } else {
      // HTTP error: server phản hồi nhưng với status code lỗi (4xx, 5xx)
      console.error("API HTTP Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        hasToken: !!localStorage.getItem("token"),
        currentPath: window.location.pathname,
      });
    }

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Don't auto-redirect for profile page - let component handle the error
      if (currentPath === "/profile" || currentPath.startsWith("/profile/")) {
        console.warn("401 on profile page - letting component handle error");
        // Don't clear token or redirect - let the component show error message
        return Promise.reject(error);
      }

      // Chỉ redirect nếu KHÔNG phải đang ở trang login hoặc forgot-password
      // (tránh reload khi login sai password)
      if (currentPath !== "/login" && currentPath !== "/forgot-password") {
        // Token expired or invalid - clear storage and redirect to login
        console.warn(
          "401 Unauthorized - Clearing token and redirecting to login",
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Use navigate if available, otherwise use window.location
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
