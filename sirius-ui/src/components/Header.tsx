import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SiriusIcon from "./icons/SiriusIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { initializeTheme } from "~/utils/theme";
import { handleSignOut } from "~/utils/auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "~/components/lib/ui/dropdown-menu";
import { Switch } from "~/components/lib/ui/switch";
import {
  Moon,
  Sun,
  Settings,
  Activity,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

interface HeaderProps {
  title: string;
}

interface AvatarProps {
  onClick?: () => void;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-center rounded-full border border-violet-400/30 bg-violet-900/20 p-3 transition-all hover:scale-105 hover:border-violet-400/50 hover:bg-violet-800/30 ${
        className ?? ""
      }`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-violet-200"
      >
        {/* Constellation-style user icon - clearer human form */}

        {/* Head - larger and more prominent */}
        <circle
          cx="12"
          cy="5.5"
          r="2.5"
          fill="currentColor"
          className="drop-shadow-[0_0_2px_currentColor]"
        />

        {/* Neck connection point */}
        <circle cx="12" cy="9" r="0.8" fill="currentColor" opacity="0.8" />

        {/* Shoulders */}
        <circle cx="8" cy="11.5" r="1.2" fill="currentColor" />
        <circle cx="16" cy="11.5" r="1.2" fill="currentColor" />

        {/* Torso/waist */}
        <circle cx="10" cy="15" r="1" fill="currentColor" />
        <circle cx="14" cy="15" r="1" fill="currentColor" />

        {/* Legs/feet */}
        <circle cx="9.5" cy="19" r="1.1" fill="currentColor" />
        <circle cx="14.5" cy="19" r="1.1" fill="currentColor" />

        {/* Connection lines - stronger and more visible */}
        <path
          d="M12 8 L12 9 M12 9 L8 11.5 M12 9 L16 11.5 M8 11.5 L10 15 M16 11.5 L14 15 M10 15 L9.5 19 M14 15 L14.5 19"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.5"
          strokeLinecap="round"
        />

        {/* Subtle glow effect for the head */}
        <circle
          cx="12"
          cy="5.5"
          r="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.2"
        />
      </svg>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { data: sessionData } = useSession();

  const handleLogout = () => {
    void handleSignOut();
  };

  useEffect(() => {
    // Initialize theme on mount
    const isDark = initializeTheme();
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    window.localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const handleMenu = () => {
    console.log("Menu clicked");
  };

  const UserMenu: React.FC = () => {
    const { data: sessionData } = useSession();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }, []);

    const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      document.documentElement.classList.toggle("dark", newDarkMode);
      window.localStorage.setItem("darkMode", newDarkMode.toString());
    };

    return (
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-72 border-violet-500/20 bg-[#1a1b2e]/95 p-2 shadow-xl shadow-violet-950/50 backdrop-blur-xl"
            align="end"
            sideOffset={8}
          >
            {/* User Info Section */}
            <DropdownMenuLabel className="mb-2 p-0">
              <div className="flex items-center gap-3 rounded-lg border border-violet-500/10 bg-violet-950/30 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-violet-900/40 ring-2 ring-violet-500/20">
                  <User className="h-5 w-5 text-violet-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-normal text-violet-300/60">
                    Logged in as
                  </span>
                  <span className="text-sm font-semibold text-violet-100">
                    {sessionData?.user?.name || sessionData?.user?.id || "User"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-violet-500/10" />

            {/* Theme Toggle */}
            <DropdownMenuGroup>
              <div className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-violet-600/10">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="h-4 w-4 text-violet-300" />
                  ) : (
                    <Sun className="h-4 w-4 text-violet-300" />
                  )}
                  <span className="text-sm text-violet-100">
                    {darkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                  className="data-[state=checked]:bg-violet-600"
                />
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-violet-500/10" />

            {/* Navigation Items */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="group cursor-pointer rounded-md px-3 py-2.5 text-violet-100 transition-colors hover:bg-violet-600/10 focus:bg-violet-600/10"
                onClick={() => void router.push("/settings")}
              >
                <Settings className="mr-3 h-4 w-4 text-violet-300 group-hover:text-violet-200" />
                <span className="flex-1">Settings</span>
                <ChevronRight className="h-4 w-4 text-violet-400/40 transition-all group-hover:translate-x-0.5 group-hover:text-violet-300/60" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="group cursor-pointer rounded-md px-3 py-2.5 text-violet-100 transition-colors hover:bg-violet-600/10 focus:bg-violet-600/10"
                onClick={() => void router.push("/system-monitor")}
              >
                <Activity className="mr-3 h-4 w-4 text-violet-300 group-hover:text-violet-200" />
                <span className="flex-1">System Monitor</span>
                <ChevronRight className="h-4 w-4 text-violet-400/40 transition-all group-hover:translate-x-0.5 group-hover:text-violet-300/60" />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-violet-500/10" />

            {/* Sign Out */}
            <DropdownMenuItem
              className="group cursor-pointer rounded-md px-3 py-2.5 text-red-400 transition-colors hover:bg-red-600/10 hover:text-red-300 focus:bg-red-600/10"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:translate-x-[-2px]" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <nav className="z-50 pb-2 pl-3 pr-3 pt-4 dark:shadow-violet-300/10">
      <div className="flex items-center justify-end">
        <UserMenu />
      </div>
    </nav>
  );
};

export default Header;
