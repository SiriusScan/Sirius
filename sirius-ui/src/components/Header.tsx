import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SiriusIcon from "./icons/SiriusIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { initializeTheme } from "~/utils/theme";
import { handleSignOut } from "~/utils/auth";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/lib/ui/popover";

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
      className={`cursor-pointer rounded-full border border-violet-100 p-2 ${
        className ?? ""
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
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
      <div className="flex items-center space-x-4">
        <div className="pr-5">
          <Popover>
            <PopoverTrigger>
              <Avatar className="transition-colors hover:bg-violet-200/30" />
            </PopoverTrigger>
            <PopoverContent className="mr-5 w-72">
              <div className="rounded-md border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                <div className="flex flex-col space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 border-b border-gray-700/50 pb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={0.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">
                        Logged in as
                      </span>
                      <span className="text-sm font-medium text-white">
                        {sessionData?.user?.name || sessionData?.user?.id}
                      </span>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-2 rounded-md py-1.5 text-gray-400 transition-colors hover:bg-violet-600/10 hover:text-white"
                  >
                    {darkMode ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={0.5}
                        stroke="currentColor"
                        className="h-8 w-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={0.5}
                        stroke="currentColor"
                        className="h-8 w-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                        />
                      </svg>
                    )}
                    <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
                  </button>

                  {/* Settings Link */}
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 rounded-md py-1.5 text-gray-400 transition-colors hover:bg-violet-600/10 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={0.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                      />
                    </svg>
                    <span>Settings</span>
                  </Link>

                  {/* System Monitor Link */}
                  <Link
                    href="/system-monitor"
                    className="flex items-center space-x-2 rounded-md py-1.5 text-gray-400 transition-colors hover:bg-violet-600/10 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={0.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>System Monitor</span>
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => void handleSignOut()}
                    className="flex items-center space-x-2 rounded-md py-1.5 text-gray-400 transition-colors hover:bg-violet-600/10 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={0.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                      />
                    </svg>
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  return (
    <nav className="z-50 p-2 pl-3 dark:shadow-violet-300/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* <SiriusIcon className="h-8 w-8 text-white" fill="white" /> */}
          {/* <span className="ml-2 text-xl font-bold">{title}</span> */}
        </div>
        <UserMenu />
      </div>
    </nav>
  );
};

export default Header;
