// Log service for centralized logging system
export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  subcomponent: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, any>;
  context?: Record<string, any>;
}

export interface LogSubmissionRequest {
  service: string;
  subcomponent: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, any>;
  context?: Record<string, any>;
}

export interface LogRetrievalRequest {
  service?: string;
  level?: string;
  subcomponent?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface LogRetrievalResponse {
  logs: LogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface LogStatsResponse {
  total_logs: number;
  service_stats: Record<string, number>;
  level_stats: Record<string, number>;
  recent_logs: LogEntry[];
}

export interface LogServiceOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export class LogService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(options: LogServiceOptions = {}) {
    this.baseUrl =
      options.baseUrl ||
      process.env.NEXT_PUBLIC_SIRIUS_API_URL ||
      "http://localhost:9001";
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
  }

  /**
   * Submit a log entry to the centralized logging system
   */
  async submitLog(
    request: LogSubmissionRequest
  ): Promise<{ log_id: string; message: string }> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/api/v1/logs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to submit log entry");
    }

    return response.json();
  }

  /**
   * Retrieve logs with filtering and pagination
   */
  async getLogs(
    request: LogRetrievalRequest = {}
  ): Promise<LogRetrievalResponse> {
    const params = new URLSearchParams();

    if (request.service) params.append("service", request.service);
    if (request.level) params.append("level", request.level);
    if (request.subcomponent)
      params.append("subcomponent", request.subcomponent);
    if (request.search) params.append("search", request.search);
    if (request.limit) params.append("limit", request.limit.toString());
    if (request.offset) params.append("offset", request.offset.toString());

    const url = `${this.baseUrl}/api/v1/logs?${params.toString()}`;
    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to retrieve logs");
    }

    return response.json();
  }

  /**
   * Get log statistics
   */
  async getLogStats(): Promise<LogStatsResponse> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/api/v1/logs/stats`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to retrieve log statistics");
    }

    return response.json();
  }

  /**
   * Get logs with automatic retry logic
   */
  async getLogsWithRetry(
    request: LogRetrievalRequest = {}
  ): Promise<LogRetrievalResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        return await this.getLogs(request);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Log retrieval attempt ${attempt} failed:`, error);

        if (attempt < this.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Failed to retrieve logs after all retries");
  }

  /**
   * Get log statistics with automatic retry logic
   */
  async getLogStatsWithRetry(): Promise<LogStatsResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        return await this.getLogStats();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Log stats retrieval attempt ${attempt} failed:`, error);

        if (attempt < this.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw (
      lastError ||
      new Error("Failed to retrieve log statistics after all retries")
    );
  }

  /**
   * Start polling for logs with automatic updates
   */
  startLogPolling(
    onUpdate: (logs: LogRetrievalResponse) => void,
    onError: (error: Error) => void,
    request: LogRetrievalRequest = {},
    options: { interval?: number; retries?: number } = {}
  ): () => void {
    const interval = options.interval || 5000; // 5 seconds
    const retries = options.retries || 3;

    let isPolling = true;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const logs = await this.getLogsWithRetry(request);
        onUpdate(logs);
      } catch (error) {
        onError(error as Error);
      }

      if (isPolling) {
        timeoutId = setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Start polling for log statistics
   */
  startStatsPolling(
    onUpdate: (stats: LogStatsResponse) => void,
    onError: (error: Error) => void,
    options: { interval?: number; retries?: number } = {}
  ): () => void {
    const interval = options.interval || 10000; // 10 seconds
    const retries = options.retries || 3;

    let isPolling = true;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const stats = await this.getLogStatsWithRetry();
        onUpdate(stats);
      } catch (error) {
        onError(error as Error);
      }

      if (isPolling) {
        timeoutId = setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Get log level color for UI display
   */
  getLogLevelColor(level: string): string {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  }

  /**
   * Get log level badge variant for UI display
   */
  getLogLevelBadgeVariant(
    level: string
  ): "default" | "secondary" | "destructive" | "outline" {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "outline";
      case "info":
        return "default";
      case "debug":
        return "secondary";
      default:
        return "secondary";
    }
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  }

  /**
   * Format relative time for display
   */
  formatRelativeTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) {
        return `${diffSeconds}s ago`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return `${diffDays}d ago`;
      }
    } catch {
      return "Unknown";
    }
  }
}

// Export singleton instance
export const logService = new LogService();
