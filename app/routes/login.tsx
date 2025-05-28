import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sessionStorage } from "../utils/session.server";

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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Log In</h1>
      <Form method="post" className="bg-gray-900 p-8 rounded shadow-md w-80 flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded"
        >
          Log In
        </button>
        {actionData?.error && (
          <p className="text-red-400 text-sm mt-2">{actionData.error}</p>
        )}
      </Form>
    </div>
  );
}
