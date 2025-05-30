import { PrismaClient } from "@prisma/client";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import GameCard from "../components/GameCard";
import { getUserId } from "../utils/session.server";
import Unauthorized from "../components/Unauthorized";
import GameLogButton from "../components/GameLogButton";
import React, { useState, useEffect } from "react";

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
  // Get the deleted flag from the URL
  const url = new URL(request.url);
  const deleted = url.searchParams.get("deleted") === "1";
  return json({ games, deleted });
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
    // Pass a success message via query string
    return redirect("/all-games?deleted=1");
  }
  return null;
};

export default function AllGames() {
  const { games, deleted } = useLoaderData<typeof loader>();
  if (!games) {
    return <Unauthorized message="You must be logged in to view your games." />;
  }
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <h1 className="font-bold text-4xl text-center mb-10">
          All <span className="text-cyan-400">Games</span>
        </h1>
        {deleted && (
          <div className="mb-6 text-teal-400 text-center font-semibold bg-gray-800 rounded p-3 shadow">
            Game deleted successfully!
          </div>
        )}
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
                <input type="hidden" name="gameId" value={game.id} />
                <input type="hidden" name="intent" value="delete" />
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
              </Form>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            You haven't added any games yet. Start by adding a new game!
          </p>
        )}
        <div className="mt-10 text-center">
          <a
            href="/add-game"
            className="inline-block bg-cyan-500 text-gray-950 font-semibold py-3 px-6 rounded-lg shadow hover:bg-cyan-600 transition-all"
          >
            + Add New Game
          </a>
        </div>
      </div>
    </div>
  );
}
