import { PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";


export const meta: MetaFunction = () => {
  return [
    { title: "GameLog" },
    { name: "description", content: "Track your game collection" },
  ];
};

export async function loader() {
  const prisma = new PrismaClient();
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
      releaseDate: true,
      category: {
        select: {
          title: true,
        },
      },
    },
  });
  return json({ games });
}

export default function Index() {
  const { games } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen bg-[#071212] text-gray-50">
      <div className="flex-1">
        <div className="container mx-auto py-8 px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Games</h2>
            <a
              href="/games"
              className="text-sm text-teal-400 hover:underline"
              aria-label="See all games"
            >
            </a>
          </div>

          {games.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {games.map((game) => {
                // Use local image if available, else fallback to imageUrl or default image
                const imageUrl = localImages[game.title] || game.imageUrl || defaultImg;

                return (
                  <GameCard
                    key={game.id}
                    imageUrl={imageUrl}
                    title={game.title}
                    genre={game.category?.title || "Uncategorized"}
                    date={new Date(game.releaseDate).toLocaleDateString()}
                    onView={() => console.log("View", game.id)}
                    onDelete={() => console.log("Delete", game.id)}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-16">
              No games added yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
