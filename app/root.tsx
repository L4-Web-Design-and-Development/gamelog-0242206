import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import siteLogo from "~/assets/svg/gamelog-logo.svg";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col min-h-screen bg-gray-950 text-gray-50">
          <div className="flex-1">
            <nav className="container mx-auto flex justify-between flex-wrap py-8 p-8">
              <div>
                <Link to="/">
                  <img
                    src={siteLogo}
                    alt="GameLog Logo"
                    className="h-9 w-auto"
                  />
                </Link>
              </div>

              <div className="flex items-center gap-8">
                <Link to="/games">Games</Link>
                <Link to="/about">About</Link>
                <Link to="/blog">Blog</Link>
              </div>
            </nav>
            <Outlet />
          </div>
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}
