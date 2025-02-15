import { type ScanResult } from "~/components/scanner/ScanStatus";

export function b64Decode(base64String: string) {
  if (!base64String) {
    return null;
  }
  try {
    const decodedString = atob(base64String);
    return JSON.parse(decodedString) as ScanResult;
  } catch (error) {
    console.error("Failed to decode Base64 JSON:", error);
    return null;
  }
}
