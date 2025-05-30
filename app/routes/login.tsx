import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sessionStorage } from "../utils/session.server";
import GameLogButton from "../components/GameLogButton";
import { useState } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.$disconnect();
  if (!user) {
    return json({ error: "Invalid email or password" }, { status: 400 });
  }

  if (!user.isEmailVerified) {
    return json(
      { error: "Please verify your email before logging in." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return json({ error: "Invalid email or password" }, { status: 400 });
  }

  const session = await sessionStorage.getSession();
  session.set("userId", user.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Log In</h1>
        <Form
          method="post"
          className="bg-gray-900 p-8 rounded shadow-md w-80 flex flex-col gap-4"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="p-2 rounded bg-gray-800 border border-gray-700 text-white w-full pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-400 focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.88A9.956 9.956 0 0021 12c-1.73-4-5.06-7-9-7-1.47 0-2.87.27-4.16.76M6.12 6.12A9.956 9.956 0 003 12c1.73 4 5.06 7 9 7 1.47 0 2.87-.27 4.16-.76"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.12 2.88A9.956 9.956 0 0021 12c-1.73-4-5.06-7-9-7-3.94 0-7.27 3-9 7a9.956 9.956 0 001.88 2.88M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12"
                  />
                </svg>
              )}
            </button>
          </div>
          <GameLogButton
            type="submit"
            className="w-full"
            variant="primary"
            size="md"
          >
            Log In
          </GameLogButton>
          {actionData?.error && (
            <p className="text-red-400 text-sm mt-2">{actionData.error}</p>
          )}
        </Form>
        <p className="mt-4 text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-teal-400 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
