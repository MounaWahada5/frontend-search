const BASE_URL = "http://localhost:5000/api";

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");

  // Create headers object
  const headers = new Headers();
  // Only set Content-Type for JSON if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers.append("Content-Type", "application/json");
  }
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  // Configure request
  const config: RequestInit = {
    ...options,
    headers,
    mode: "cors",
  };

  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log("API request to:", fullUrl);
    const response = await fetch(fullUrl, config);
    console.log("Raw response:", response);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearToken();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", {
        endpoint,
        status: response.status,
        error: errorData.error || "Unknown error",
      });
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Parsed response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("API Fetch Failed:", {
      endpoint,
      error: error.message,
    });
    throw new Error(`API call to ${endpoint} failed: ${error.message}`);
  }
};

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};