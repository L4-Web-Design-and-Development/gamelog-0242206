import { PrismaClient } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import type { MetaFunction, ActionFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";

import zeldaImg from "~/assets/png/zelda.png";
import defaultImg from "~/assets/svg/gamelog-logo.svg";

const localImages: Record<string, string> = {
  "The Legend of Zelda: Breath of the Wild": zeldaImg,
  // Add other mappings here
};

export const meta: MetaFunction = () => [
  { title: "GameLog" },
  { name: "description", content: "Track your game collection" },
];

const prisma = new PrismaClient();

export async function loader() {
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const gameId = formData.get("gameId");
  if (typeof gameId !== "string") {
    throw new Response("Invalid game ID", { status: 400 });
  }
  await prisma.game.delete({ where: { id: gameId } });
  return redirect("/");
};

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
              See all →
            </a>
          </div>

          {games.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {games.map((game) => {
                const imageUrl =
                  localImages[game.title] || game.imageUrl || defaultImg;

                return (
                  <GameCard
                    key={game.id}
                    imageUrl={imageUrl}
                    title={game.title}
                    genre={game.category?.title || "Uncategorized"}
                    date={new Date(game.releaseDate).toLocaleDateString()}
                    onView={() => console.log("View", game.id)}
                    // Remove onDelete prop, use deleteForm below
                    deleteForm={
                      <Form
                        method="post"
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              `Are you sure you want to delete "${game.title}"?`
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="gameId" value={game.id} />
                        <button
                          type="submit"
                          className="w-24 border border-red-400 text-red-400 rounded px-4 py-1 text-xs hover:bg-red-900 transition"
                        >
                          Delete
                        </button>
                      </Form>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-16">No games added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
