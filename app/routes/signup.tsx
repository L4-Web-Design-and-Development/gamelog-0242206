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
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.$disconnect();
    return json({ error: "Email already in use" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });
  await prisma.$disconnect();

  const session = await sessionStorage.getSession();
  session.set("userId", user.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
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
            Sign Up
          </button>
          {actionData?.error && (
            <p className="text-red-400 text-sm mt-2">{actionData.error}</p>
          )}
        </Form>
      </div>
    </div>
  );
}
