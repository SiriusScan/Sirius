// Health check service for system monitoring
export interface ServiceHealth {
  status: "up" | "down" | "loading" | "error";
  message?: string;
  timestamp: string;
  port?: number;
}

export interface SystemHealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  services: Record<string, ServiceHealth>;
  overall: string;
}

export interface HealthCheckOptions {
  retries?: number;
  timeout?: number;
  interval?: number;
}

class HealthCheckService {
  private baseUrl: string;
  private defaultOptions: Required<HealthCheckOptions> = {
    retries: 3,
    timeout: 5000,
    interval: 5000, // 5 seconds
  };

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_SIRIUS_API_URL ||
      "http://localhost:9001"
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Performs a single health check for all services
   */
  async checkSystemHealth(
    options: HealthCheckOptions = {}
  ): Promise<SystemHealthResponse> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/v1/system/health`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        opts.timeout
      );

      if (!response.ok && response.status !== 503) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const data: SystemHealthResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error(
        `Failed to check system health: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Performs a simple health check for the API service only
   */
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/health`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        3000
      );

      return response.ok;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  }

  /**
   * Starts polling for health checks at regular intervals
   */
  startPolling(
    onUpdate: (health: SystemHealthResponse) => void,
    onError: (error: Error) => void,
    options: HealthCheckOptions = {}
  ): () => void {
    const opts = { ...this.defaultOptions, ...options };
    let isPolling = true;
    let retryCount = 0;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const health = await this.checkSystemHealth(opts);
        onUpdate(health);
        retryCount = 0; // Reset retry count on success
      } catch (error) {
        retryCount++;
        console.error(
          `Health check failed (attempt ${retryCount}/${opts.retries}):`,
          error
        );

        if (retryCount >= opts.retries) {
          onError(
            new Error(
              `Health check failed after ${opts.retries} attempts: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
          retryCount = 0; // Reset for next cycle
        }
      }

      // Schedule next poll
      if (isPolling) {
        setTimeout(poll, opts.interval);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }

  /**
   * Fetches with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Gets service status with loading state
   */
  getServiceStatus(
    serviceName: string,
    health: SystemHealthResponse | null
  ): ServiceHealth {
    if (!health) {
      return {
        status: "loading",
        message: "Checking...",
        timestamp: new Date().toISOString(),
      };
    }

    const service = health.services[serviceName];
    if (!service) {
      return {
        status: "error",
        message: "Service not found",
        timestamp: new Date().toISOString(),
      };
    }

    return service;
  }

  /**
   * Gets overall system status
   */
  getOverallStatus(
    health: SystemHealthResponse | null
  ): "up" | "down" | "loading" | "error" {
    if (!health) return "loading";

    switch (health.overall) {
      case "healthy":
        return "up";
      case "degraded":
        return "down";
      default:
        return "error";
    }
  }

  /**
   * Gets count of services by status
   */
  getServiceCounts(
    health: SystemHealthResponse | null
  ): Record<string, number> {
    if (!health) {
      return { up: 0, down: 0, loading: 0, error: 0 };
    }

    const counts = { up: 0, down: 0, loading: 0, error: 0 };

    Object.values(health.services).forEach((service) => {
      switch (service.status) {
        case "up":
          counts.up++;
          break;
        case "down":
          counts.down++;
          break;
        case "loading":
          counts.loading++;
          break;
        case "error":
          counts.error++;
          break;
      }
    });

    return counts;
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService();

// Export class for testing
export { HealthCheckService };
