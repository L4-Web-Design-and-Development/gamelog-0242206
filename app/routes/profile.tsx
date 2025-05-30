import { json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserId } from "../utils/session.server";
import { useState } from "react";
import { uploadProfilePic } from "../utils/cloudinary.server";
import GameCard from "../components/GameCard";
import GameLogButton from "../components/GameLogButton";

export const loader = async ({ request }: { request: Request }) => {
  const userId = await getUserId(request);
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true, // Add username
      email: true,
      createdAt: true,
      profilePicUrl: true,
      games: {
        select: {
          id: true,
          title: true,
          releaseDate: true,
          imageUrl: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  await prisma.$disconnect();
  if (!user) throw new Response("User not found", { status: 404 });
  return json({ user });
};

export const action = async ({ request }: { request: Request }) => {
  const userId = await getUserId(request);
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const contentType = request.headers.get("content-type") || "";
  if (contentType.startsWith("multipart/form-data")) {
    const uploadHandler = unstable_createMemoryUploadHandler();
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const file = formData.get("profilePic");
    if (!file || typeof file !== "object") {
      return json({ error: "No file uploaded" }, { status: 400 });
    }
    // Convert File to Buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
      const url = await uploadProfilePic(buffer);
      const prisma = new PrismaClient();
      await prisma.user.update({ where: { id: userId }, data: { profilePicUrl: url } });
      await prisma.$disconnect();
      return json({ success: true });
    } catch (err) {
      return json({ error: "Upload failed" }, { status: 500 });
    }
  }
  return json({ error: "Invalid request" }, { status: 400 });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Helper for fetcher.data type
  type FetcherData = { error?: string; success?: boolean };
  const fetcherData = fetcher.data as FetcherData | undefined;

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

  const gamesToShow = user.games.slice(0, 2); // Show only 2 games
  const hasMoreGames = user.games.length > 2;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        {/* Profile Info Section */}
        <div className="w-full flex flex-col items-center">
          <img
            src={user.profilePicUrl || "/default-profile.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-teal-500 mb-4"
          />
          <div className="text-2xl font-semibold mb-2">{user.username}</div>
          <fetcher.Form method="post" encType="multipart/form-data" className="flex flex-col items-center gap-2 w-full">
            <input type="file" name="profilePic" accept="image/*" className="text-sm" required />
            <button type="submit" className="px-3 py-1 bg-teal-600 rounded hover:bg-teal-500 text-white text-sm">Upload New Picture</button>
          </fetcher.Form>
          {fetcherData?.error && <p className="text-red-400 text-sm mt-1">{fetcherData.error}</p>}
          {fetcherData?.success && <p className="text-teal-400 text-sm mt-1">Profile picture updated!</p>}
          <div className="bg-gray-900 rounded-lg p-6 shadow mt-6 w-full">
            {/* Only show email to the user, not as primary identity */}
            <p className="text-lg mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Games Added:</span> {user.games.length}</p>
            <GameLogButton
              className="w-full mb-2 mt-4"
              variant="outline"
              size="md"
              onClick={handleResetPassword}
              type="button"
            >
              Reset Password
            </GameLogButton>
            <GameLogButton
              className="w-full"
              variant="danger"
              size="md"
              onClick={handleDeleteAccount}
              type="button"
            >
              Delete Account
            </GameLogButton>
            {status && <p className="mt-4 text-sm text-teal-400">{status}</p>}
          </div>
        </div>
        {/* Games Overview Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Your Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {gamesToShow.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                imageUrl={game.imageUrl || "/default-profile.png"}
                title={game.title}
                genre={""}
                date={game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : ""}
                showEdit={false}
              />
            ))}
          </div>
          {hasMoreGames && (
            <div className="flex justify-center mt-8">
              <Link to="/all-games" className="px-5 py-2 border border-teal-400 text-teal-400 rounded hover:bg-teal-900 transition">
                View All Games
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
