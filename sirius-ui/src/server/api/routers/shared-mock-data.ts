import { type SiriusHost } from "./host";

// Keep a shared store of mock hosts with vulnerabilities
let mockHosts: SiriusHost[] = [];

/**
 * Store mock hosts for use across API handlers
 */
export function storeMockHosts(hosts: SiriusHost[]) {
  mockHosts = [...hosts];
  console.log(`Stored ${mockHosts.length} mock hosts with vulnerabilities`);
}

/**
 * Get the stored mock hosts
 */
export function getMockHosts(): SiriusHost[] {
  return mockHosts;
}

/**
 * Check if we have mock hosts available
 */
export function hasMockHosts(): boolean {
  return mockHosts.length > 0;
}
