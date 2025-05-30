import { PrismaClient } from "@prisma/client";
import { json, redirect, type ActionFunction, type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { useState, useMemo } from "react";
import GameCard from "~/components/GameCard";
import { getUserId } from "../utils/session.server";
import Unauthorized from "../components/Unauthorized";
import GameLogButton from "../components/GameLogButton";

const defaultImg = "https://via.placeholder.com/300x200?text=No+Image";
const localImages: Record<string, string> = {};

export const meta: MetaFunction = () => [
  { title: "GameLog" },
  { name: "description", content: "Track your game collection" },
];

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login"); // Redirect unauthenticated users to login
  const prisma = new PrismaClient();
  // Fetch all games for stats, but only show 4 in the grid
  const allGames = await prisma.game.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      releaseDate: true,
      hoursPlayed: true, // <-- fetch hoursPlayed
      category: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  // Only fetch the first 4 games for the index page
  const games = allGames.slice(0, 4);
  // Fetch the 3 most recent blog posts (with user and game info)
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      user: { select: { username: true, profilePicUrl: true } },
      game: { select: { title: true, imageUrl: true } },
    },
  });
  await prisma.$disconnect();
  return json({ games, allGames, posts });
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login"); // Prevent unauthenticated actions
  const formData = await request.formData();
  const gameId = formData.get("gameId");
  if (typeof gameId !== "string") {
    throw new Response("Invalid game ID", { status: 400 });
  }
  await prisma.game.delete({ where: { id: gameId } });
  return redirect("/");
};

export default function Index() {
  const { games, allGames, posts } = useLoaderData<typeof loader>();
  // Game of the Week: pick a random game, but change every week
  const gameOfTheWeek = useMemo(() => {
    if (!allGames.length) return null;
    // Use the current week number and year to pick a deterministic random game
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week = Math.floor(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const idx = (week + now.getFullYear()) % allGames.length;
    return allGames[idx];
  }, [allGames]);

  // Calculate total hours played
  const totalHours = allGames.reduce((sum, g) => (typeof g.hoursPlayed === 'number' ? sum + g.hoursPlayed : sum), 0);

  // Stats: remove Achievements
  const stats = [
    { label: "Games Logged", value: allGames.length },
    { label: "Total Hours", value: totalHours },
  ];

  // If games is undefined, user is not authorized (loader returned 401/redirect)
  if (!games) {
    return <Unauthorized message="You must be logged in to view your games." />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-8 px-6">
        {/* Hero/Stats Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-cyan-400 drop-shadow">Welcome to GameLog</h1>
            <p className="text-gray-300 mb-4 max-w-xl">Track, review, and share your gaming journey. Log your games, write posts, and see your stats at a glance.</p>
            <GameLogButton as="a" href="/add-game" variant="primary" size="md" className="mt-2">+ Add Game</GameLogButton>
          </div>
          <div className="flex flex-row gap-6 bg-gray-900 rounded-xl shadow-lg p-6 items-center justify-center">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl font-bold text-cyan-400">{stat.value}</span>
                <span className="text-gray-300 text-sm mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Game of the Week + Recent Games Section */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Recent Games (2x2 grid, now on the left) */}
          <div className="col-span-2 flex flex-col items-center order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4 w-full">
              {games.slice(0, 4).map((game) => (
                <Link key={game.id} to={`/games/${game.id}`} className="block hover:opacity-90 transition">
                  <GameCard
                    imageUrl={game.imageUrl || localImages[game.title] || defaultImg}
                    title={game.title}
                    genre={game.category?.title || "Uncategorized"}
                    date={new Date(game.releaseDate).toLocaleDateString()}
                    id={game.id}
                    showEdit={false}
                  />
                </Link>
              ))}
              {/* See All button centered under the games grid */}
              <div className="col-span-2 flex justify-center mt-4">
                <GameLogButton as="a" href="/all-games" variant="outline" size="md">
                  See All
                </GameLogButton>
              </div>
            </div>
          </div>
          {/* Game of the Week (now on the right) */}
          {gameOfTheWeek && (
            <div className="col-span-1 bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center order-1 md:order-2">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Game of the Week</h2>
              <img
                src={gameOfTheWeek.imageUrl || defaultImg}
                alt={gameOfTheWeek.title}
                className="w-28 h-28 object-cover rounded-xl border border-cyan-700 shadow mb-4"
              />
              <h3 className="text-base font-bold mb-1 text-white text-center">{gameOfTheWeek.title}</h3>
              <p className="text-cyan-400 text-xs mb-1 text-center">{gameOfTheWeek.category?.title || "Uncategorized"}</p>
              <p className="text-gray-300 text-xs mb-2 text-center">Released: {new Date(gameOfTheWeek.releaseDate).toLocaleDateString()}</p>
              <GameLogButton as="a" href={`/games/${gameOfTheWeek.id}`} variant="primary" size="sm">View Game</GameLogButton>
            </div>
          )}
        </div>
        {/* Blog/Activity Feed Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Recent Blog Posts</h2>
          <div className="bg-cyan-950 rounded-xl shadow-lg p-6 flex flex-col gap-4">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-800">
                  <div className="flex items-center gap-3 mb-1">
                    {post.user?.profilePicUrl ? (
                      <img src={post.user.profilePicUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-base font-bold text-cyan-400">
                        {post.user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-white">{post.user?.username || "Unknown User"}</span>
                      <span className="text-xs text-gray-400 ml-2">{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block bg-cyan-900/60 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {post.game?.title || "Unknown Game"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-cyan-300 mb-1">{post.title}</h3>
                  <p className="text-gray-200 whitespace-pre-line mb-1">{post.content}</p>
                  {post.game?.imageUrl && (
                    <img 
                      src={post.game.imageUrl} 
                      alt={post.game.title} 
                      className="w-full max-w-xs h-32 object-cover rounded-xl border-2 border-cyan-900 shadow-md mx-auto mt-2 mb-2"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No blog posts yet. Start sharing your thoughts on your favorite games!</p>
            )}
            <GameLogButton as="a" href="/blog" variant="outline" size="md">Go to Blog</GameLogButton>
          </div>
        </div>
      </div>
    </div>
  );
}
