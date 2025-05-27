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
  if (!game) throw new Response("Not found", { status: 404 });
  return json({ game });
}

export default function GameDetails() {
  const { game } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Banner Section */}
      <div className="relative w-full h-96 bg-gray-900 flex items-center justify-center">
        <img
          src={game.imageUrl || "https://via.placeholder.com/800x320?text=No+Image"}
          alt={game.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 flex flex-col items-start max-w-3xl w-full px-8">
          <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
          <p className="text-teal-400 text-lg mb-2">{game.category?.title}</p>
          <p className="text-gray-300 mb-2">
            Released: {new Date(game.releaseDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* Description Section */}
      <div className="max-w-3xl mx-auto mt-8 px-8">
        <h2 className="text-2xl font-semibold mb-4">Game Overview</h2>
        <p className="text-gray-200">{game.description || "No description available."}</p>
      </div>
    </div>
  );
}