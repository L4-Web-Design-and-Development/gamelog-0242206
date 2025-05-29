import { PrismaClient } from "@prisma/client";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import GameCard from "../components/GameCard";
import { getUserId } from "../utils/session.server";
import Unauthorized from "../components/Unauthorized";
import GameLogButton from "../components/GameLogButton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const prisma = new PrismaClient();
  const games = await prisma.game.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      releaseDate: true,
      category: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  await prisma.$disconnect();
  return json({ games });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const formData = await request.formData();
  const intent = formData.get("intent");
  const gameId = formData.get("gameId");
  if (intent === "delete" && typeof gameId === "string") {
    const prisma = new PrismaClient();
    await prisma.game.delete({ where: { id: gameId, userId } });
    await prisma.$disconnect();
    return redirect("/all-games");
  }
  return null;
};

export default function AllGames() {
  const { games } = useLoaderData<typeof loader>();
  if (!games) {
    return <Unauthorized message="You must be logged in to view your games." />;
  }
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <h1 className="font-bold text-4xl text-center mb-10">
          All <span className="text-cyan-400">Games</span>
        </h1>
        {games.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => (
              <Form
                key={game.id}
                method="post"
                id={`delete-form-${game.id}`}
                onSubmit={(e) => {
                  if (!window.confirm("Are you sure you want to delete this game?"))
                    e.preventDefault();
                }}
              >
                <GameCard
                  imageUrl={
                    game.imageUrl ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  title={game.title}
                  genre={game.category?.title || "Uncategorized"}
                  date={new Date(game.releaseDate).toLocaleDateString()}
                  id={game.id}
                  showDelete={true}
                  onDelete={() => {
                    // Submit the form when Delete is clicked
                    const form = document.getElementById(`delete-form-${game.id}`) as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }}
                />
                <input type="hidden" name="gameId" value={game.id} />
                <input type="hidden" name="intent" value="delete" />
                {/* Remove separate delete button, handled by GameCard */}
              </Form>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-16">
            No games added yet
          </p>
        )}
      </div>
    </div>
  );
}
