import { Link } from "@remix-run/react";
import siteLogo from "~/assets/svg/gamelog-logo.svg";

export default function NotFound({ message = "The page you are looking for does not exist." }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded shadow-md w-96 text-center border border-teal-700 flex flex-col items-center">
        <img src={siteLogo} alt="GameLog Logo" className="h-16 w-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-teal-400">404 Not Found</h1>
        <p className="mb-6 text-gray-300">{message}</p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded font-semibold transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
