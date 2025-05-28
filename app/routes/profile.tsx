import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserId } from "../utils/session.server";
import { useState } from "react";

export const loader = async ({ request }: { request: Request }) => {
  const userId = await getUserId(request);
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      createdAt: true,
      games: { select: { id: true } },
    },
  });
  await prisma.$disconnect();
  if (!user) throw new Response("User not found", { status: 404 });
  return json({ user });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleResetPassword() {
    setStatus(null);
    try {
      const res = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        setStatus("A password reset email has been sent to your address.");
      } else {
        setStatus("Failed to send reset email. Please try again later.");
      }
    } catch {
      setStatus("Failed to send reset email. Please try again later.");
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setStatus(null);
    try {
      const res = await fetch("/delete-account", { method: "POST" });
      if (res.ok) {
        navigate("/logout");
      } else {
        setStatus("Failed to delete account. Please try again later.");
      }
    } catch {
      setStatus("Failed to delete account. Please try again later.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-16 px-4 max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Profile</h1>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <p className="text-lg mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
          <p className="text-lg mb-2"><span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p className="text-lg mb-2"><span className="font-semibold">Games Added:</span> {user.games.length}</p>
          <button
            className="mt-6 px-5 py-2 bg-teal-600 rounded hover:bg-teal-500 text-white font-semibold transition"
            onClick={handleResetPassword}
            type="button"
          >
            Reset Password
          </button>
          <button
            className="mt-4 px-5 py-2 bg-red-600 rounded hover:bg-red-500 text-white font-semibold transition"
            onClick={handleDeleteAccount}
            type="button"
          >
            Delete Account
          </button>
          {status && <p className="mt-4 text-sm text-teal-400">{status}</p>}
        </div>
      </div>
    </div>
  );
}
