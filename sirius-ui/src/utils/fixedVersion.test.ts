import assert from "node:assert/strict";
import { findFixedVersion } from "./fixedVersion";

const cases: Array<[string, string | null, string | undefined]> = [
  ["Use After Free vulnerability in Apache HTTP Server with mod_ldap in per-directory configuration. This issue affects Apache HTTP Server: from 2.4.0 through 2.4.67. Users are recommended to upgrade to version 2.4.68, which fixes the issue.", "2.4.68", "Apache HTTP Server"],
  ["sshd in OpenSSH before 10.0p2 on Linux, when musl libc is used without PAM, lacks a check.", "10.0p2", "OpenSSH"],
  ["ssh in OpenSSH before 10.4 can have a use-after-free when a server changes its host key.", "10.4", "OpenSSH"],
  ["In OpenSSH before 10.3, a file downloaded by scp may be installed setuid or setgid.", "10.3", "OpenSSH"],
  ["In sshd in OpenSSH before 10.4, DisableForwarding=yes was supposed to take precedence.", "10.4", "OpenSSH"],
  ["OpenSSH before 10.3 mishandles the authorized_keys principals option in uncommon cases.", "10.3", "OpenSSH"],
  ["A flaw was found in a change made to path normalization in Apache HTTP Server 2.4.49. This issue only affects Apache 2.4.49 and not earlier versions. The fix in Apache HTTP Server 2.4.50 was found to be incomplete, see CVE-2021-42013.", null, undefined],
  ["This issue is fixed in version 1.2.3.", "1.2.3", undefined],
  ["Some text with no version at all.", null, undefined],
];
for (const [text, version, product] of cases) {
  const found = findFixedVersion(text);
  assert.equal(found?.version ?? null, version, text);
  if (version) assert.equal(found?.product, product, text);
}
console.log("fixedVersion: " + cases.length + " cases pass");
