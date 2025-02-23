// src/hooks/useStartScan.ts
import { useState } from 'react';
import { api } from "~/utils/api";
import { type ScanTemplate, type ScanResult } from "~/types/scanTypes";

export type TargetType = 'single_ip' | 'ip_range' | 'cidr' | 'dns_name' | 'dns_wildcard';

interface Target {
  value: string;
  type: TargetType;
}

interface ScanRequest {
  id: string;
  targets: Target[];
  options: {
    template: ScanTemplate;
  };
  priority: number;
}

export const useStartScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendMessage = api.queue.sendMsg.useMutation();
  const updateScan = api.store.setValue.useMutation();
  const utils = api.useContext();

  const generateScanId = () => {
    return `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const initiateScan = async (
    targets: Target[],
    template: ScanTemplate,
    priority: number = 3
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const scanRequest: ScanRequest = {
        id: generateScanId(),
        targets,
        options: {
          template,
        },
        priority,
      };

      const message = JSON.stringify(scanRequest);
      await sendMessage.mutateAsync({ message, queue: "scan" });

      const scan: ScanResult = {
        id: scanRequest.id,
        status: "running",
        targets: targets.map(t => t.value),
        hosts: [],
        hosts_completed: 0,
        vulnerabilities: [],
        start_time: new Date().toISOString(),
      };

      await updateScan.mutateAsync({
        key: "currentScan",
        value: btoa(JSON.stringify(scan))
      });

      await utils.store.getValue.invalidate();

      return scan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateScan,
    isLoading,
    error,
  };
};

// Example usage:
/*
const MyComponent = () => {
  const { initiateScan, isLoading, error } = useStartScan();

  const handleScan = async () => {
    const targets = [
      {
        value: '192.168.1.1',
        type: 'single_ip' as TargetType,
      },
      {
        value: '192.168.1.0/24',
        type: 'cidr' as TargetType,
      }
    ];

    const template = {
      aggressive: true,
      excludePorts: ['22', '3389'],
      scanTypes: ['discovery', 'vulnerability'],
      maxRetries: 3,
      parallel: true,
    };

    try {
      await initiateScan(targets, template, 3);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  return (
    // ... component JSX
  );
};
*/