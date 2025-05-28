import { json, redirect } from "@remix-run/node";
import { useActionData, Form, useParams } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useState } from "react";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { token } = params;
  const formData = await request.formData();
  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 8) {
    return json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const prisma = new PrismaClient();
  // Look up the user by resetToken and check expiry
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });
  if (!user) {
    await prisma.$disconnect();
    return json({ error: "Invalid or expired reset link." }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, resetToken: null, resetTokenExpiry: null }
  });
  await prisma.$disconnect();
  return redirect("/login?reset=success");
};

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();
  const { token } = useParams();
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <Form method="post">
          <input type="hidden" name="token" value={token} />
          <label className="block mb-2 font-semibold">New Password</label>
          <input
            type={show ? "text" : "password"}
            name="password"
            minLength={8}
            required
            className="w-full rounded bg-black border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
          />
          <label className="flex items-center mb-4">
            <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} className="mr-2" />
            Show password
          </label>
          {actionData?.error && <p className="text-red-400 mb-2">{actionData.error}</p>}
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 rounded py-2 font-semibold transition">Reset Password</button>
        </Form>
      </div>
    </div>
  );
}
