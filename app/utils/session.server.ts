import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_gamelog_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET || "supersecret"],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  return session.get("userId");
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) throw redirect("/login");
  return userId;
}

export { sessionStorage as default };
