import React, { useState, useMemo } from "react";
import { api } from "~/utils/api";
import {
  Users,
  User,
  Shield,
  Terminal,
  Search,
  Crown,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "~/components/lib/utils";
import { SECTION_HEADER } from "~/utils/themeConstants";

interface UserAccountsProps {
  hostIp: string;
}

interface SystemFingerprintData {
  fingerprint?: {
    users?: {
      localUsers?: Array<{
        username: string;
        fullName?: string;
        uid: string;
        gid?: string;
        homeDirectory?: string;
        shell?: string;
        accountType?: string;
        account_type?: string;
        enabled: boolean;
        description?: string;
      }>;
      users?: Array<{
        username: string;
        fullName?: string;
        uid: string;
        gid?: string;
        homeDirectory?: string;
        shell?: string;
        accountType?: string;
        account_type?: string;
        enabled: boolean;
        description?: string;
      }>;
      localGroups?: Array<{
        name: string;
        gid?: string;
        description?: string;
        type: string;
        members?: string[];
      }>;
      groups?: Array<{
        name: string;
        gid?: string;
        description?: string;
        type: string;
        members?: string[];
      }>;
      current_user?: {
        username: string;
        is_admin?: boolean;
        sudo_access?: boolean;
        groups?: string[];
      };
      login_sessions?: Array<{
        username: string;
        sessionType: string;
        status: string;
        loginTime?: string;
        terminal?: string;
      }>;
    };
  };
  collected_at?: string;
  source?: string;
}

const SYSTEM_USERNAMES = new Set([
  "daemon", "bin", "sys", "sync", "games", "man", "lp", "mail",
  "news", "uucp", "proxy", "www-data", "backup", "list", "irc",
  "gnats", "nobody", "systemd-network", "systemd-resolve", "syslog",
  "messagebus", "uuidd", "dnsmasq", "sshd",
]);

const UserAccounts: React.FC<UserAccountsProps> = ({ hostIp }) => {
  const [activeSection, setActiveSection] = useState<"users" | "groups" | "sessions">("users");
  const [searchFilter, setSearchFilter] = useState("");
  const [showSystemUsers, setShowSystemUsers] = useState(false);

  const {
    data: fingerprintData,
    isLoading,
    isError,
    refetch,
  } = api.host.getHostSystemFingerprint.useQuery(
    { ip: hostIp },
    { enabled: !!hostIp, staleTime: 60000 },
  ) as {
    data: SystemFingerprintData | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const userData = useMemo(() => {
    if (!fingerprintData?.fingerprint?.users) {
      return { users: [], groups: [], privileges: null, sessions: [] };
    }
    const u = fingerprintData.fingerprint.users;
    return {
      users: u.users ?? u.localUsers ?? [],
      groups: u.groups ?? u.localGroups ?? [],
      privileges: u.current_user ?? null,
      sessions: u.login_sessions ?? [],
    };
  }, [fingerprintData]);

  const filteredUsers = useMemo(() => {
    let filtered = userData.users;
    if (!showSystemUsers) {
      filtered = filtered.filter(
        (user) =>
          !user.username.startsWith("_") &&
          !user.username.startsWith("$") &&
          !SYSTEM_USERNAMES.has(user.username),
      );
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(q) ||
          user.fullName?.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [userData.users, showSystemUsers, searchFilter]);

  const filteredGroups = useMemo(() => {
    if (!searchFilter) return userData.groups;
    const q = searchFilter.toLowerCase();
    return userData.groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q),
    );
  }, [userData.groups, searchFilter]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (isError || !fingerprintData) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="flex flex-col items-center gap-3 py-6">
          <Users className="h-6 w-6 text-gray-600" />
          <p className="text-sm text-gray-500">Failed to load user data</p>
          <button
            onClick={() => void refetch()}
            className="rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sectionTabs: Array<{ id: typeof activeSection; label: string; icon: typeof User; count: number }> = [
    { id: "users", label: "Users", icon: User, count: filteredUsers.length },
    { id: "groups", label: "Groups", icon: Users, count: userData.groups.length },
    { id: "sessions", label: "Sessions", icon: Terminal, count: userData.sessions.length },
  ];

  return (
    <div className="space-y-4">
      {/* Current user privileges */}
      {userData.privileges && (
        <div className="scanner-section flex items-center gap-3 px-3 py-2.5">
          <Shield className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-white">{userData.privileges.username}</span>
          {userData.privileges.is_admin && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
              <Crown className="h-3 w-3" /> Admin
            </span>
          )}
          {userData.privileges.sudo_access && (
            <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-400">
              Sudo
            </span>
          )}
          {userData.privileges.groups && userData.privileges.groups.length > 0 && (
            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
              {userData.privileges.groups.length} groups
            </span>
          )}
        </div>
      )}

      {/* Search + system user toggle */}
      <div className="scanner-section scanner-section-padding">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${activeSection}...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-md border border-violet-500/10 bg-gray-900/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-600 focus:border-violet-500/30 focus:outline-none"
            />
          </div>
          {activeSection === "users" && (
            <button
              onClick={() => setShowSystemUsers((p) => !p)}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                showSystemUsers
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                  : "border-violet-500/10 text-gray-500 hover:text-gray-300"
              }`}
            >
              {showSystemUsers ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              System
            </button>
          )}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 rounded-lg border border-violet-500/10 bg-gray-900/30 p-1">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-gray-500 hover:text-gray-300",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className="ml-0.5 text-[10px] text-gray-600">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="scanner-section overflow-hidden">
        {activeSection === "users" && (
          filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-violet-500/10 text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">UID</th>
                    <th className="px-3 py-2 font-medium">Home</th>
                    <th className="px-3 py-2 font-medium">Shell</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/5">
                  {filteredUsers.map((user, idx) => (
                    <tr key={`${user.username}-${idx}`} className="text-gray-300 hover:bg-gray-900/30">
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-white">{user.username}</span>
                          {user.enabled ? (
                            <UserCheck className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <UserX className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        {user.fullName && (
                          <div className="text-[10px] text-gray-500">{user.fullName}</div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-gray-500">{user.uid}</td>
                      <td className="px-3 py-1.5 font-mono text-gray-500">{user.homeDirectory || "—"}</td>
                      <td className="px-3 py-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getShellColor(user.shell)}`}>
                          {user.shell?.split("/").pop() || "none"}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          user.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                        }`}>
                          {user.enabled ? (user.account_type ?? user.accountType ?? "active") : "disabled"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptySection icon={<User className="h-5 w-5 text-gray-600" />} message="No users match filters" />
          )
        )}

        {activeSection === "groups" && (
          filteredGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-violet-500/10 text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">Group</th>
                    <th className="px-3 py-2 font-medium">GID</th>
                    <th className="px-3 py-2 font-medium">Members</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/5">
                  {filteredGroups.map((group, idx) => (
                    <tr key={`${group.name}-${idx}`} className="text-gray-300 hover:bg-gray-900/30">
                      <td className="px-3 py-1.5">
                        <span className="font-medium text-white">{group.name}</span>
                        {group.description && (
                          <div className="text-[10px] text-gray-500">{group.description}</div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-gray-500">{group.gid || "—"}</td>
                      <td className="px-3 py-1.5">
                        {group.members && group.members.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {group.members.slice(0, 5).map((m, i) => (
                              <span key={i} className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">{m}</span>
                            ))}
                            {group.members.length > 5 && (
                              <span className="text-[10px] text-gray-500">+{group.members.length - 5}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">{group.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptySection icon={<Users className="h-5 w-5 text-gray-600" />} message="No groups match filters" />
          )
        )}

        {activeSection === "sessions" && (
          userData.sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-violet-500/10 text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Terminal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/5">
                  {userData.sessions.map((session, idx) => (
                    <tr key={`${session.username}-${idx}`} className="text-gray-300 hover:bg-gray-900/30">
                      <td className="px-3 py-1.5 font-medium text-white">{session.username}</td>
                      <td className="px-3 py-1.5">
                        <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] text-blue-400">{session.sessionType}</span>
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          session.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-800 text-gray-400"
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 font-mono text-gray-500">{session.terminal || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptySection icon={<Terminal className="h-5 w-5 text-gray-600" />} message="No active sessions" />
          )
        )}
      </div>
    </div>
  );
};

function EmptySection({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      {icon}
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

function getShellColor(shell?: string): string {
  if (!shell) return "bg-gray-800 text-gray-400";
  if (shell.includes("nologin") || shell.includes("false")) return "bg-red-500/15 text-red-400";
  if (shell.includes("bash")) return "bg-emerald-500/15 text-emerald-400";
  if (shell.includes("zsh")) return "bg-blue-500/15 text-blue-400";
  return "bg-gray-800 text-gray-400";
}

export default UserAccounts;
