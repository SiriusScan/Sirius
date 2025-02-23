import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Layout from "~/components/Layout";
import { useUserSettings } from "~/hooks/useUserSettings";

type SettingsTab = "general" | "security" | "notifications";

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
    // Clear form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-extralight text-white">Settings</h1>
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="flex flex-col space-y-1">
              <button
                className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
                  activeTab === "general"
                    ? "bg-violet-600/20 text-white"
                    : "text-gray-400 hover:bg-violet-600/10"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
                  activeTab === "security"
                    ? "bg-violet-600/20 text-white"
                    : "text-gray-400 hover:bg-violet-600/10"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
              <button
                className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
                  activeTab === "notifications"
                    ? "bg-violet-600/20 text-white"
                    : "text-gray-400 hover:bg-violet-600/10"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-paper flex-1 rounded-md border-violet-700/10 p-6 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
            {activeTab === "general" && (
              <form onSubmit={handleUserNameSubmit} className="space-y-6">
                <h2 className="mb-4 text-xl font-extralight text-white">
                  General Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-400">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-gray-400"
                      value={sessionData?.user?.email ?? ""}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-400">
                      User Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
                      placeholder="Enter your user name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    {profile?.name === userName && (
                      <span className="mt-1 text-xs text-gray-500">
                        Current user name
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 rounded-md bg-violet-600/20 px-4 py-2 text-white transition-colors hover:bg-violet-600/30 disabled:opacity-50"
                  >
                    {isLoading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <h2 className="mb-4 text-xl font-extralight text-white">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-400">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-400">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-400">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 rounded-md bg-violet-600/20 px-4 py-2 text-white transition-colors hover:bg-violet-600/30 disabled:opacity-50"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="mb-4 text-xl font-extralight text-white">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 opacity-50">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      className="h-4 w-4 cursor-not-allowed rounded border-gray-600 bg-gray-800/20 text-violet-600"
                      disabled
                    />
                    <label
                      htmlFor="emailNotifications"
                      className="cursor-not-allowed text-sm font-semibold text-gray-400"
                    >
                      Email Notifications
                      <span className="ml-2 text-xs text-gray-500">
                        (Coming soon)
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 opacity-50">
                    <input
                      type="checkbox"
                      id="scanComplete"
                      className="h-4 w-4 cursor-not-allowed rounded border-gray-600 bg-gray-800/20 text-violet-600"
                      disabled
                    />
                    <label
                      htmlFor="scanComplete"
                      className="cursor-not-allowed text-sm font-semibold text-gray-400"
                    >
                      Notify when scan completes
                      <span className="ml-2 text-xs text-gray-500">
                        (Coming soon)
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 opacity-50">
                    <input
                      type="checkbox"
                      id="vulnerabilityFound"
                      className="h-4 w-4 cursor-not-allowed rounded border-gray-600 bg-gray-800/20 text-violet-600"
                      disabled
                    />
                    <label
                      htmlFor="vulnerabilityFound"
                      className="cursor-not-allowed text-sm font-semibold text-gray-400"
                    >
                      Notify on new vulnerabilities
                      <span className="ml-2 text-xs text-gray-500">
                        (Coming soon)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
