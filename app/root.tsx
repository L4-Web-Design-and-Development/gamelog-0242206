import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import { getUserSession } from "./utils/session.server";
import { PrismaClient } from "@prisma/client";
import NotFound from "./components/NotFound";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  let user = null;
  if (userId) {
    const prisma = new PrismaClient();
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, profilePicUrl: true },
    });
    await prisma.$disconnect();
  }
  return json({ user });
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className="bg-gray-950 text-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col min-h-screen bg-gray-950 text-gray-50">
          <div className="flex-1">
            <Navbar user={user ? { ...user, profilePicUrl: user.profilePicUrl ?? undefined, username: user.username ?? undefined } : null} />
            <Outlet />
          </div>
          <Footer />
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error?: Error }) {
  // If no error or error is not an object, show NotFound
  if (!error || typeof error !== "object") {
    return <NotFound />;
  }
  // Show 404 page for not found errors, else generic error
  if (error.message && error.message.match(/not found|404|No route matches|No routes matched/i)) {
    return <NotFound />;
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded shadow-md w-96 text-center border border-red-700">
        <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong</h1>
        <p className="mb-6 text-gray-300">{error.message || "Unknown error"}</p>
        <a href="/" className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded font-semibold transition">Go Home</a>
      </div>
    </div>
  );
}
