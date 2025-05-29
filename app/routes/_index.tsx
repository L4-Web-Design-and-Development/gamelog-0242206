import { PrismaClient } from "@prisma/client";
import { json, redirect, type ActionFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import GameCard from "~/components/GameCard";
import { getUserId } from "../utils/session.server";

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
  const games = await prisma.game.findMany({
    where: { userId },
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
  await prisma.$disconnect();
  return json({ games });
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
  const { games } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
                  game.imageUrl || localImages[game.title] || defaultImg;

                return (
                  <Form
                    key={game.id}
                    method="post"
                    onSubmit={(e) => {
                      if (
                        !confirm(`Are you sure you want to delete "${game.title}"?`)
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {/* Card is clickable using Link */}
                    <Link to={`/games/${game.id}`} className="block hover:opacity-90 transition">
                      <GameCard
                        imageUrl={imageUrl}
                        title={game.title}
                        genre={game.category?.title || "Uncategorized"}
                        date={new Date(game.releaseDate).toLocaleDateString()}
                        id={game.id}
                        onDelete={() => {
                          const form = document.activeElement?.closest("form");
                          if (form) (form as HTMLFormElement).requestSubmit();
                        }}
                      />
                    </Link>
                    <input type="hidden" name="gameId" value={game.id} />
                  </Form>
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
