import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Layout from "~/components/Layout";
import { useUserSettings } from "~/hooks/useUserSettings";
import { useUrlTab } from "~/hooks/useUrlTab";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Label } from "~/components/lib/ui/label";
import { PageHeader } from "~/components/shared/PageHeader";
import { PageTabs, type PageTab } from "~/components/shared/PageTabs";
import { ScanningSettings } from "~/components/settings/scanning/ScanningSettings";
import {
  Settings as SettingsIcon,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "~/utils/api";
import { uiExtensionRegistry, useCapabilities } from "~/ui/extensions";

// ── Tab definitions ───────────────────────────────────────────────────────────
// Community's tabs come first; extension settings panels follow under their
// own ids. The active tab lives in ?tab= (ADR-6), so /settings?tab=<id>
// opens any of them, contributed panels included. Notifications stays hidden
// until it ships.
const COMMUNITY_TABS: readonly PageTab[] = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "apikeys", label: "API keys" },
];
const SCANNING_TAB: PageTab = { id: "scanning", label: "Scanning" };
const DEFAULT_TAB = "general";

// ── Page Component ────────────────────────────────────────────────────────────
const Settings: NextPage = () => {
  const { data: sessionData } = useSession();
  const { hasAll } = useCapabilities();
  // Scanning configuration is part of the Scanner (ADR-7): same capability.
  const canScan = hasAll(["ui.scanner"]);
  const extensionPanels = uiExtensionRegistry.settingsPanels.filter((panel) =>
    hasAll(panel.requiredCapabilities ?? []),
  );
  const tabs: PageTab[] = [
    ...COMMUNITY_TABS,
    ...(canScan ? [SCANNING_TAB] : []),
    ...extensionPanels.map((panel) => ({ id: panel.id, label: panel.title })),
  ];
  const [activeTab] = useUrlTab(
    tabs.map((tab) => tab.id),
    DEFAULT_TAB,
  );
  const ActivePanel = extensionPanels.find(
    (panel) => panel.id === activeTab,
  )?.component;

  const { profile, isLoading, handleUpdateProfile, handleChangePassword } =
    useUserSettings(sessionData?.user?.id || "");

  // Initialize userName state with the profile name when it loads
  const [userName, setUserName] = useState("");
  useEffect(() => {
    if (profile?.name) {
      setUserName(profile.name);
    }
  }, [profile?.name]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update the general settings section
  const handleUserNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateProfile(userName);
  };

  // Update the security section
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleChangePassword(currentPassword, newPassword, confirmPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Layout>
      <div className="relative z-20 -mt-14 space-y-6">
        <PageHeader
          icon={SettingsIcon}
          title="Settings"
          tabs={
            <PageTabs
              tabs={tabs}
              defaultTab={DEFAULT_TAB}
              aria-label="Settings sections"
            />
          }
        />

        {/* ── Scanning tab: its own sections ───────────────────────────── */}
        {activeTab === "scanning" && <ScanningSettings />}

        {/* ── Content panel ────────────────────────────────────────────── */}
        {activeTab !== "scanning" && (
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6">
            {/* ── General tab ──────────────────────────────────────────── */}
            {activeTab === "general" && (
              <form onSubmit={handleUserNameSubmit}>
                <h2 className="mb-6 text-lg font-medium text-white">
                  General Settings
                </h2>
                <div className="max-w-lg space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span id="settings-email-label" className="text-sm font-medium text-gray-400">
                        Email
                      </span>
                      <span className="rounded border border-gray-700/60 px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        Read-only
                      </span>
                    </div>
                    <p
                      aria-labelledby="settings-email-label"
                      className="truncate rounded-md bg-gray-900/40 px-3 py-2 text-sm text-gray-300"
                      title={sessionData?.user?.email ?? undefined}
                    >
                      {sessionData?.user?.email ? sessionData.user.email : <span className="text-gray-500">Not set</span>}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Sign-in Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter your user name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400"
                    />
                    {profile?.name === userName && (
                      <p className="text-xs text-gray-500">Current user name</p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="mt-2">
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            )}

            {/* ── Security tab ─────────────────────────────────────────── */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit}>
                <h2 className="mb-6 text-lg font-medium text-white">
                  Security Settings
                </h2>
                <div className="max-w-lg space-y-5">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Current Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">
                      Confirm New Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="mt-2">
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            )}

            {/* ── API Keys tab ────────────────────────────────────────── */}
            {activeTab === "apikeys" && <APIKeysPanel />}

            {/* ── Extension panels ─────────────────────────────────────── */}
            {ActivePanel && <ActivePanel />}
          </div>
        )}
      </div>
    </Layout>
  );
};

// ── API Keys Panel ─────────────────────────────────────────────────────────
function APIKeysPanel() {
  const utils = api.useContext();
  const { data: keys, isLoading } = api.apikeys.listKeys.useQuery();

  const createMutation = api.apikeys.createKey.useMutation({
    onSuccess: () => void utils.apikeys.listKeys.invalidate(),
  });
  const revokeMutation = api.apikeys.revokeKey.useMutation({
    onSuccess: () => void utils.apikeys.listKeys.invalidate(),
  });

  const [label, setLabel] = useState("");
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    const result = await createMutation.mutateAsync({ label: label.trim() });
    setNewRawKey(result.key);
    setLabel("");
    setShowKey(true);
  };

  const handleCopy = async () => {
    if (!newRawKey) return;
    await navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    await revokeMutation.mutateAsync({ id });
    setConfirmRevoke(null);
  };

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-white">API Key Management</h2>

      {/* ── Generate new key form ────────────────────────────────── */}
      <form onSubmit={handleCreate} className="mb-8 max-w-lg">
        <p className="mb-3 text-sm text-gray-400">
          API keys allow external tools to authenticate with the Sirius API. All
          keys have full access.
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Key label (e.g. CI Pipeline)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={createMutation.isLoading || !label.trim()}
            className="shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {createMutation.isLoading ? "Creating…" : "Generate"}
          </Button>
        </div>
      </form>

      {/* ── Newly created key reveal ──────────────────────────────── */}
      {newRawKey && (
        <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-amber-400">
            Your new API key — copy it now. It will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-gray-900 px-3 py-2 font-mono text-sm text-green-400">
              {showKey ? newRawKey : "•".repeat(40)}
            </code>
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="rounded p-2 text-gray-400 hover:text-white"
              title={showKey ? "Hide" : "Reveal"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded p-2 text-gray-400 hover:text-white"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </button>
            {copied && (
              <span className="text-xs text-green-400">Copied!</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setNewRawKey(null); setShowKey(false); }}
            className="mt-2 text-xs text-gray-500 underline hover:text-gray-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Existing keys table ───────────────────────────────────── */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading keys…</p>
      ) : !keys || keys.length === 0 ? (
        <p className="text-sm text-gray-500">
          No API keys yet. Generate one above.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-700/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700/40 bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Prefix</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last Used</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-mono text-gray-300">{k.prefix}</td>
                  <td className="px-4 py-3 text-gray-300">{k.label}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {k.created_at
                      ? new Date(k.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {k.last_used_at
                      ? new Date(k.last_used_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmRevoke === k.id ? (
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-400">Revoke?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRevoke(k.id)}
                          disabled={revokeMutation.isLoading}
                          className="h-7 px-2 text-xs"
                        >
                          Confirm
                        </Button>
                        <button
                          type="button"
                          onClick={() => setConfirmRevoke(null)}
                          className="text-xs text-gray-500 hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRevoke(k.id)}
                        className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Revoke key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Settings;
