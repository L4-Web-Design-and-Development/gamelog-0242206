import { PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";

// Import local images
import zeldaImg from "~/assets/png/zelda.png";
// Import other local images here, e.g.:
// import witcherImg from "~/assets/png/witcher.png";
// import minecraftImg from "~/assets/png/minecraft.png";

import defaultImg from "~/assets/svg/gamelog-logo.svg";

// Map game titles to local images
const localImages: Record<string, string> = {
  "The Legend of Zelda: Breath of the Wild": zeldaImg,
  // Add other mappings here, e.g.:
  // "The Witcher 3: Wild Hunt": witcherImg,
  // "Minecraft": minecraftImg,
};

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
