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
import { Badge } from "~/components/lib/ui/badge";
import { cn } from "~/components/lib/utils";

interface UserAccountsProps {
  hostIp: string;
}

interface UserAccount {
  username: string;
  fullName?: string;
  uid: string;
  gid?: string;
  homeDirectory?: string;
  shell?: string;
  accountType: string;
  enabled: boolean;
  description?: string;
}

interface UserGroup {
  name: string;
  gid?: string;
  description?: string;
  type: string;
  members?: string[];
}

interface UserPrivileges {
  username: string;
  isAdmin?: boolean;
  sudoAccess?: boolean;
  groups?: string[];
}

interface LoginSession {
  username: string;
  sessionType: string;
  status: string;
  loginTime?: string;
  terminal?: string;
}

interface SystemFingerprintData {
  fingerprint?: {
    users?: {
      localUsers?: UserAccount[];
      localGroups?: UserGroup[];
      currentUserPrivileges?: UserPrivileges;
      loginSessions?: LoginSession[];
    };
  };
  collected_at?: string;
  source?: string;
}

const UserAccounts: React.FC<UserAccountsProps> = ({ hostIp }) => {
  const [activeSection, setActiveSection] = useState<
    "users" | "groups" | "sessions"
  >("users");
  const [searchFilter, setSearchFilter] = useState("");
  const [showSystemUsers, setShowSystemUsers] = useState(false);

  // Fetch system fingerprint data
  const {
    data: fingerprintData,
    isLoading,
    isError,
    refetch,
  } = api.host.getHostSystemFingerprint.useQuery(
    { ip: hostIp },
    {
      enabled: !!hostIp,
      staleTime: 60000,
    }
  ) as {
    data: SystemFingerprintData | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Extract user data from fingerprint
  const userData = useMemo(() => {
    if (!fingerprintData?.fingerprint?.users) {
      return {
        users: [],
        groups: [],
        privileges: null,
        sessions: [],
      };
    }

    const users = fingerprintData.fingerprint.users;
    return {
      users: users.users || [],
      groups: users.groups || [],
      privileges: users.current_user || null,
      sessions: users.login_sessions || [],
    };
  }, [fingerprintData]);

  // Filter users based on search and system user visibility
  const filteredUsers = useMemo(() => {
    let filtered = userData.users;

    // Filter out system users if toggle is off
    if (!showSystemUsers) {
      filtered = filtered.filter(
        (user) =>
          !user.username.startsWith("_") &&
          !user.username.startsWith("$") &&
          ![
            "daemon",
            "bin",
            "sys",
            "sync",
            "games",
            "man",
            "lp",
            "mail",
            "news",
            "uucp",
            "proxy",
            "www-data",
            "backup",
            "list",
            "irc",
            "gnats",
            "nobody",
            "systemd-network",
            "systemd-resolve",
            "syslog",
            "messagebus",
            "uuidd",
            "dnsmasq",
            "sshd",
          ].includes(user.username)
      );
    }

    // Apply search filter
    if (searchFilter) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    return filtered;
  }, [userData.users, showSystemUsers, searchFilter]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchFilter) return userData.groups;
    return userData.groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [userData.groups, searchFilter]);

  // Get user account type badge color
  const getAccountTypeBadge = (accountType: string, enabled: boolean) => {
    if (!enabled) {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    }
    switch (accountType.toLowerCase()) {
      case "local":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "domain":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "service":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // Get shell badge color
  const getShellBadge = (shell?: string) => {
    if (!shell)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";

    if (shell.includes("nologin") || shell.includes("false")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    }
    if (shell.includes("bash")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    }
    if (shell.includes("zsh")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
          <span className="ml-2">Loading user accounts...</span>
        </div>
      </div>
    );
  }

  if (isError || !fingerprintData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            User Accounts
          </h3>
        </div>
        <div className="text-center">
          <p className="mb-4 text-gray-500">
            Failed to load user account data.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sectionTabs = [
    {
      id: "users" as const,
      label: "Users",
      icon: User,
      count: filteredUsers.length,
    },
    {
      id: "groups" as const,
      label: "Groups",
      icon: Users,
      count: userData.groups.length,
    },
    {
      id: "sessions" as const,
      label: "Sessions",
      icon: Terminal,
      count: userData.sessions.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-violet-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              User Accounts
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {fingerprintData.collected_at
                ? new Date(fingerprintData.collected_at).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Source: {fingerprintData.source || "Unknown"}
            </p>
          </div>
        </div>

        {/* Current User Privileges */}
        {userData.privileges && (
          <div className="mb-4 rounded-md bg-violet-50 p-4 dark:bg-violet-900/20">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-violet-500" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Current User: {userData.privileges.username}
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  {userData.privileges.is_admin && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                      <Crown className="mr-1 h-3 w-3" />
                      Administrator
                    </Badge>
                  )}
                  {userData.privileges.sudo_access && (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                      Sudo Access
                    </Badge>
                  )}
                  {userData.privileges.groups &&
                    userData.privileges.groups.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        {userData.privileges.groups.length} Groups
                      </Badge>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.groups.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-orange-50 p-4 dark:bg-orange-900/20">
            <div className="flex items-center">
              <Terminal className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.sessions.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Filter & Search
          </h4>
          {activeSection === "users" && (
            <button
              onClick={() => setShowSystemUsers(!showSystemUsers)}
              className="flex items-center text-sm text-violet-500 hover:text-violet-600"
            >
              {showSystemUsers ? (
                <EyeOff className="mr-1 h-4 w-4" />
              ) : (
                <Eye className="mr-1 h-4 w-4" />
              )}
              {showSystemUsers ? "Hide System Users" : "Show System Users"}
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeSection}...`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {sectionTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "flex items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                  activeSection === tab.id
                    ? "border-violet-500 text-violet-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                )}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {activeSection === "users" && (
          <>
            <div className="p-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                User Accounts ({filteredUsers.length})
              </h4>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        UID/GID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Home Directory
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Shell
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={`${user.username}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.username}
                              </div>
                              {user.enabled ? (
                                <UserCheck className="ml-2 h-4 w-4 text-green-500" />
                              ) : (
                                <UserX className="ml-2 h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {user.fullName && (
                              <div className="text-sm text-gray-500">
                                {user.fullName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          <div>
                            <div>UID: {user.uid}</div>
                            {user.gid && <div>GID: {user.gid}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-sm text-gray-900 dark:text-white">
                          {user.homeDirectory || "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={`text-xs ${getShellBadge(user.shell)}`}
                          >
                            {user.shell?.split("/").pop() || "none"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={`text-xs ${getAccountTypeBadge(
                              user.account_type,
                              user.enabled
                            )}`}
                          >
                            {user.enabled ? user.account_type : "disabled"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No user accounts match your current filters.
                </p>
              </div>
            )}
          </>
        )}

        {activeSection === "groups" && (
          <>
            <div className="p-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                User Groups ({filteredGroups.length})
              </h4>
            </div>

            {filteredGroups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        GID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Members
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredGroups.map((group, index) => (
                      <tr
                        key={`${group.name}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {group.name}
                            </div>
                            {group.description && (
                              <div className="text-sm text-gray-500">
                                {group.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          {group.gid || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          {group.members && group.members.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {group.members.map((member, idx) => (
                                <Badge
                                  key={idx}
                                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                >
                                  {member}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            "No members"
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                            {group.type}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No groups found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No user groups match your current filters.
                </p>
              </div>
            )}
          </>
        )}

        {activeSection === "sessions" && (
          <>
            <div className="p-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Login Sessions ({userData.sessions.length})
              </h4>
            </div>

            {userData.sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Session Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Terminal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {userData.sessions.map((session, index) => (
                      <tr
                        key={`${session.username}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {session.username}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            {session.sessionType}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={cn(
                              "text-xs",
                              session.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                            )}
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          {session.terminal || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Terminal className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No active sessions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No login sessions are currently active.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserAccounts;
