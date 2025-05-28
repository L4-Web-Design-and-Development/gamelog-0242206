import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export default function Logout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ...existing code... */}
    </div>
  );
}
