import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SiriusIcon from "./icons/SiriusIcon";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/lib/ui/popover";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { data: sessionData } = useSession();

  const handleLogout = () => {
    void signOut();
  };

  // Detect and set the initial theme mode
  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
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

  const UserMenu = () => (
    <div className="flex items-center space-x-4">
      <svg
        width="24"
        height="24"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.60124 1.25086C8.60124 1.75459 8.26278 2.17927 7.80087 2.30989C10.1459 2.4647 12 4.41582 12 6.79999V10.25C12 11.0563 12.0329 11.7074 12.7236 12.0528C12.931 12.1565 13.0399 12.3892 12.9866 12.6149C12.9333 12.8406 12.7319 13 12.5 13H8.16144C8.36904 13.1832 8.49997 13.4513 8.49997 13.75C8.49997 14.3023 8.05226 14.75 7.49997 14.75C6.94769 14.75 6.49997 14.3023 6.49997 13.75C6.49997 13.4513 6.63091 13.1832 6.83851 13H2.49999C2.2681 13 2.06664 12.8406 2.01336 12.6149C1.96009 12.3892 2.06897 12.1565 2.27638 12.0528C2.96708 11.7074 2.99999 11.0563 2.99999 10.25V6.79999C2.99999 4.41537 4.85481 2.46396 7.20042 2.3098C6.73867 2.17908 6.40036 1.75448 6.40036 1.25086C6.40036 0.643104 6.89304 0.150421 7.5008 0.150421C8.10855 0.150421 8.60124 0.643104 8.60124 1.25086ZM7.49999 3.29999C5.56699 3.29999 3.99999 4.86699 3.99999 6.79999V10.25L4.00002 10.3009C4.0005 10.7463 4.00121 11.4084 3.69929 12H11.3007C10.9988 11.4084 10.9995 10.7463 11 10.3009L11 10.25V6.79999C11 4.86699 9.43299 3.29999 7.49999 3.29999Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
      </svg>
      <div className="pr-5">
        <Popover>
          <PopoverTrigger>
            <Avatar onClick={handleMenu} />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <span className="text-white">
                  Logged in as {sessionData?.user?.id}
                </span>
                <Avatar />
              </div>
              <span>Settings</span>
              <button
                className="dark:bg-dark-accent bg-accent p-2 text-white"
                onClick={toggleDarkMode}
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <Logout />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const Logout = () => (
    <button
      className="rounded-md bg-black/10 px-6 py-1 font-semibold text-white no-underline transition hover:bg-white/20"
      onClick={handleLogout}
    >
      Sign out
    </button>
  );

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

const Avatar = () => {
  return (
    <div className="cursor-pointer rounded-full border border-violet-100 p-2">
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
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
      </svg>
    </div>
  );
};
