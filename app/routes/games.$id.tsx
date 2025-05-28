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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative w-full h-[28rem] flex items-end">
        <img
          src={game.imageUrl || "https://via.placeholder.com/1200x500?text=No+Image"}
          alt={game.title}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative z-10 p-10 bg-gradient-to-t from-gray-950/90 to-transparent w-full">
          <h1 className="text-5xl font-extrabold mb-2">{game.title}</h1>
          <p className="text-teal-400 text-lg mb-1">{game.category?.title}</p>
          <p className="text-gray-300 mb-4">
            Released: {new Date(game.releaseDate).toLocaleDateString()}
          </p>
          <p className="text-xl max-w-2xl">{game.description || "No description available."}</p>
        </div>
      </div>
    </div>
  );
}