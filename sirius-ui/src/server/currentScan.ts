import { valkey } from "~/server/valkey";

export const CURRENT_SCAN_KEY = "currentScan";
const COMPARE_AND_SET_SCAN = `
  if redis.call("GET", KEYS[1]) ~= ARGV[1] then
    return 0
  end
  redis.call("SET", KEYS[1], ARGV[2], "KEEPTTL")
  return 1
`;

export const currentScanStore = {
  read: () => valkey.get(CURRENT_SCAN_KEY),
  async compareAndSet(expected: string, updated: string): Promise<boolean> {
    const result = await valkey.eval(COMPARE_AND_SET_SCAN, 1, CURRENT_SCAN_KEY, expected, updated);
    return result === 1;
  },
};
