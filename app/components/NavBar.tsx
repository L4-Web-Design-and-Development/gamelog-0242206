import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import gameLogo from "~/assets/svg/gamelog-logo.svg";

interface NavBarProps {
  user?: { email: string; username?: string; profilePicUrl?: string } | null;
}

export default function Navbar({ user }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false); // close dropdown on route change
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <nav className="bg-gray-950 text-white shadow-md">
      <div className="px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={gameLogo} alt="GameLog Logo" className="h-12" />
        </Link>
        <div className="flex gap-6 items-center relative">
          <Link to="/add-game" className="hover:text-teal-400">
            Add Games
          </Link>
          <Link to="/about" className="hover:text-teal-400">
            About
          </Link>
          <Link to="/blog" className="hover:text-teal-400">
            Blog
          </Link>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 bg-teal-600 text-white rounded-full w-10 h-10 justify-center font-bold text-lg focus:outline-none overflow-hidden group transition-transform duration-200"
                onClick={() => setOpen((v) => !v)}
                aria-label="Open profile menu"
              >
                {user.profilePicUrl ? (
                  <img
                    src={user.profilePicUrl}
                    alt="Profile"
                    className="w-10 h-10 object-cover rounded-full transition-transform duration-200 group-hover:scale-110 group-focus:scale-110 shadow-lg"
                    style={{ boxShadow: '0 2px 12px 0 rgba(0, 255, 255, 0.15)' }}
                  />
                ) : (
                  <span className="transition-transform duration-200 group-hover:scale-110 group-focus:scale-110">
                    {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-900 rounded-lg shadow-lg z-50 border border-gray-800 animate-fade-in">
                  <div className="flex flex-col items-start p-4 border-b border-gray-800">
                    <span className="text-lg font-semibold text-white mb-1">
                      {user.username || user.email.split("@")[0]}
                    </span>
                    <span className="text-sm text-gray-400 mb-2">{user.email}</span>
                    <Link to="/profile" className="text-teal-400 hover:underline text-sm">
                      View your profile
                    </Link>
                  </div>
                  <div className="flex flex-col p-2">
                    <Link
                      to="/logout"
                      className="px-4 py-2 text-left text-gray-200 hover:bg-gray-800 rounded"
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:text-teal-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
