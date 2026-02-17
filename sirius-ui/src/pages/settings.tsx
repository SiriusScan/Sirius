import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Layout from "~/components/Layout";
import { useUserSettings } from "~/hooks/useUserSettings";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { cn } from "~/components/lib/utils";
import {
  Settings as SettingsIcon,
  UserCircle,
  Lock,
  Bell,
  KeyRound,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import { api } from "~/utils/api";

// ── Tab definitions ───────────────────────────────────────────────────────────
type SettingsTab = "general" | "security" | "apikeys" | "notifications";

const settingsTabs: Array<{
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "general", label: "General", icon: UserCircle },
  { id: "security", label: "Security", icon: Lock },
  { id: "apikeys", label: "API Keys", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
];

// ── Notification option definitions ───────────────────────────────────────────
const notificationOptions = [
  {
    id: "emailNotifications",
    label: "Email Notifications",
    description: "Receive email alerts for important account activity",
  },
  {
    id: "scanComplete",
    label: "Scan Complete",
    description: "Get notified when a scan finishes running",
  },
  {
    id: "vulnerabilityFound",
    label: "New Vulnerabilities",
    description: "Alert when new vulnerabilities are discovered",
  },
];

// ── Page Component ────────────────────────────────────────────────────────────
const Settings: NextPage = () => {
  const { data: sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

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
      <div className="relative z-20 -mt-14 space-y-4">
        {/* ── Sticky Header ─────────────────────────────────────────────── */}
        <div className="sticky top-2 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
          <div className="flex items-center gap-3">
            {/* Icon container */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
              <SettingsIcon className="h-6 w-6 text-violet-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Settings
            </h1>

            {/* Inline tabs */}
            <nav className="ml-1 flex shrink-0 items-center gap-1">
              {settingsTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                    activeTab === id
                      ? "bg-violet-500/20 text-white ring-1 ring-violet-500/30"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ── Content panel ────────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6">
          {/* ── General tab ──────────────────────────────────────────── */}
          {activeTab === "general" && (
            <form onSubmit={handleUserNameSubmit}>
              <h2 className="mb-6 text-lg font-medium text-white">
                General Settings
              </h2>
              <div className="max-w-lg space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <Input
                    type="email"
                    value={sessionData?.user?.email ?? ""}
                    disabled
                    className="border-gray-700 bg-gray-800/50 text-gray-500 opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">User Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter your user name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
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
                    className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
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
                    className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
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

          {/* ── Notifications tab ────────────────────────────────────── */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="mb-6 text-lg font-medium text-white">
                Notification Preferences
              </h2>
              <div className="max-w-lg space-y-5">
                {notificationOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700/40 bg-gray-800/30 px-4 py-4"
                  >
                    <div className="mr-4 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-300">
                          {opt.label}
                        </span>
                        <span className="rounded bg-gray-700/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                          Soon
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {opt.description}
                      </p>
                    </div>
                    <Switch disabled />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
            className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
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
