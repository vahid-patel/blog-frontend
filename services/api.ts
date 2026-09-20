import axios from "axios";

// Listeners for backend waking-up state
type WakeupListener = (isWaking: boolean) => void;
const wakeupListeners = new Set<WakeupListener>();

export const onServerWakeupChange = (listener: WakeupListener) => {
  wakeupListeners.add(listener);
  return () => {
    wakeupListeners.delete(listener);
  };
};

let activeWakingRequests = 0;
const notifyWakeup = (isWaking: boolean) => {
  if (isWaking) {
    activeWakingRequests++;
  } else {
    activeWakingRequests = Math.max(0, activeWakingRequests - 1);
  }
  const isServerWaking = activeWakingRequests > 0;
  wakeupListeners.forEach((fn) => fn(isServerWaking));
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000, // Allow up to 45s for cold start responses
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("blog-auth");

      if (authData) {
        try {
          const parsedAuth = JSON.parse(authData);
          const token = parsedAuth.state?.token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore parsing errors
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface RetryConfig {
  _retryCount?: number;
}

// Interceptor for automatic retries when server is sleeping/waking up
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config as typeof error.config & RetryConfig;

    if (!config) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount || 0;
    const maxRetries = 4;

    // Check if error looks like a sleeping container / network / 502/503/504 / CORS error during cold start
    const isNetworkOrColdStart =
      !error.response || // Network error / CORS blocked by browser
      error.code === "ECONNABORTED" || // Timeout
      error.code === "ERR_NETWORK" ||
      [404, 502, 503, 504].includes(error.response?.status);

    if (isNetworkOrColdStart && config._retryCount < maxRetries) {
      config._retryCount += 1;
      notifyWakeup(true);

      // Progressive delay: 3s, 4s, 5s, 6s to allow container to spin up
      const delayMs = config._retryCount * 3000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      try {
        const response = await api(config);
        notifyWakeup(false);
        return response;
      } catch (retryError) {
        notifyWakeup(false);
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);