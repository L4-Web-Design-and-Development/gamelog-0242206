import { Link, useLoaderData } from "@remix-run/react";
import gameLogo from "~/assets/svg/gamelog-logo.svg";

interface NavBarProps {
  user?: { email: string } | null;
}

export default function Navbar({ user }: NavBarProps) {
  return (
    <nav className="bg-gray-950 px-8 py-4 flex justify-between items-center shadow">
      <Link to="/" className="flex items-center gap-2">
        <img src={gameLogo} alt="GameLog Logo" className="h-12" />
      </Link>
      <div className="flex gap-6 items-center">
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
          <>
            <span className="text-gray-400 text-sm">{user.email}</span>
            <Link to="/logout" className="hover:text-teal-400">
              Logout
            </Link>
          </>
        ) : (
          <Link to="/login" className="hover:text-teal-400">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
