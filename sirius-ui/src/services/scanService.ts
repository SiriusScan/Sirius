// src/services/scanService.ts
import { api } from "~/utils/api";
import { type ScanResult } from "~/types/scanTypes";

export async function startScanForTarget(target: string) {
  const { mutateAsync: sendMessage } = api.queue.sendMsg.useMutation();
  const { mutateAsync: updateScan } = api.store.setValue.useMutation();

  const message = JSON.stringify({ message: target });
  await sendMessage({ message, queue: "scan" });

  const scan: ScanResult = {
    id: "1",
    status: "running",
    targets: [target],
    hosts: [],
    hostsCompleted: 0,
    vulnerabilities: [],
  };

  await updateScan({ key: "currentScan", value: btoa(JSON.stringify(scan)) });
}