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
  type LucideIcon,
} from "lucide-react";

// ── Tab definitions ───────────────────────────────────────────────────────────
type SettingsTab = "general" | "security" | "notifications";

const settingsTabs: Array<{
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "general", label: "General", icon: UserCircle },
  { id: "security", label: "Security", icon: Lock },
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

export default Settings;
