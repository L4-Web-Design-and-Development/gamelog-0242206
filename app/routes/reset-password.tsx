import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../utils/email.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { email } = await request.json();
  if (!email) return json({ error: "Missing email" }, { status: 400 });

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await prisma.$disconnect();
    return json({ error: "User not found" }, { status: 404 });
  }

  // Dynamically determine origin if not set in env
  let origin = process.env.ORIGIN;
  if (!origin) {
    const url = new URL(request.url);
    origin = `${url.protocol}//${url.host}`;
  }

  const token = Math.random().toString(36).slice(2) + Date.now();
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiry }
  });
  const resetUrl = `${origin}/reset/${token}`;
  await sendPasswordResetEmail(email, resetUrl);
  await prisma.$disconnect();
  return json({ ok: true });
};

export default function ResetPasswordRoute() {
  return null; // No UI, just API
}
