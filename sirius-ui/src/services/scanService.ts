// src/services/scanService.ts
import { api } from "~/utils/api";
import { type ScanResult } from "~/types/scanTypes";
import type { ScanRequest } from "../hooks/useStartScan";

export const startScan = async (request: ScanRequest) => {
  const utils = api.useContext();
  const sendMessage = api.queue.sendMsg.useMutation();
  const updateScan = api.store.setValue.useMutation();

  const message = JSON.stringify(request);
  await sendMessage.mutateAsync({ message, queue: "scan" });

  const scan: ScanResult = {
    id: request.id,
    status: "running",
    targets: request.targets.map(t => t.value),
    hosts: [],
    hostsCompleted: 0,
    vulnerabilities: [],
  };

  await updateScan.mutateAsync({
    key: "currentScan",
    value: btoa(JSON.stringify(scan))
  });

  // Invalidate queries if needed
  await utils.store.getValue.invalidate();
};

export type { ScanRequest, ScanResult };