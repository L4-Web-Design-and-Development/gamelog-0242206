import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../utils/email.server";
import { sessionStorage } from "../utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const username = form.get("username");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  const prisma = new PrismaClient();
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (existingUser) {
    await prisma.$disconnect();
    return json({ error: "Email or username already in use" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = uuidv4();
  const emailVerificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpiry,
    },
  });
  await prisma.$disconnect();

  // Send verification email
  const verifyUrl = `${process.env.BASE_URL || "http://localhost:3000"}/verify-email/${emailVerificationToken}`;
  await sendVerificationEmail(email, verifyUrl);

  return json({ success: true, message: "Check your email to verify your account." });
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const error = (actionData as any)?.error;
  const success = (actionData as any)?.success;
  const message = (actionData as any)?.message;
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
        <Form method="post" className="bg-gray-900 p-8 rounded shadow-md w-80 flex flex-col gap-4">
          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
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
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          {success && (
            <p className="text-teal-400 text-sm mt-2">{message}</p>
          )}
        </Form>
      </div>
    </div>
  );
}
