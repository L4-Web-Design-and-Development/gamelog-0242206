import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";

export async function loader({ params }: LoaderFunctionArgs) {
  const prisma = new PrismaClient();
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  await prisma.$disconnect();
  if (!game) throw new Response("Not found", { status: 404 });
  return json({ game });
}

export default function GameDetails() {
  const { game } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="container mx-auto py-12 px-4 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <img
              src={game.imageUrl || "/default-profile.png"}
              alt={game.title}
              className="w-full max-w-2xl h-80 object-cover rounded-2xl shadow-lg border-2 border-gray-800 mb-8"
            />
            <div className="w-full">
              <h1 className="text-2xl font-bold mb-1">{game.title}</h1>
              <div className="text-cyan-400 text-base mb-1">
                {game.category?.title || "Uncategorized"}
              </div>
              <div className="text-gray-300 text-sm mb-2">
                Released:{" "}
                {new Date(game.releaseDate).toLocaleDateString()}
              </div>
              <div className="text-gray-300 text-sm mb-2">
                Price:{" "}
                <span className="text-white font-semibold">
                  ${game.price?.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-300 text-sm mb-2">
                Hours Played:{" "}
                <span className="text-white font-semibold">
                  {game.hoursPlayed}
                </span>
              </div>
              <div className="text-gray-300 text-sm mb-2">
                Rating:{" "}
                <span className="text-white font-semibold">{game.rating}</span>
              </div>
              <div className="text-gray-300 text-sm mb-2">Description:</div>
              <div className="bg-gray-800 rounded p-4 text-gray-100 text-sm mt-1">
                {game.description || (
                  <span className="text-gray-400">No description available.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}