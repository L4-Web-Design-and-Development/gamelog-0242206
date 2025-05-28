import { json, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import GameForm from "~/components/GameForm";
import { getUserId } from "../utils/session.server";

// Loader to fetch categories for the form
export const loader = async () => {
  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  await prisma.$disconnect();
  return json({ categories });
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const priceStr = formData.get("price");
  const ratingStr = formData.get("rating");
  const releaseDateStr = formData.get("releaseDate");
  const categoryId = formData.get("categoryId");
  const imageUrl = formData.get("imageUrl");

  // Debug log for form data
  console.log(Object.fromEntries(formData));

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof priceStr !== "string" ||
    typeof ratingStr !== "string" ||
    typeof releaseDateStr !== "string" ||
    typeof imageUrl !== "string" ||
    typeof categoryId !== "string"
  ) {
    throw new Response("Invalid form data", { status: 400 });
  }

  if (!imageUrl) {
    return json({ error: "Image is required." }, { status: 400 });
  }

  const price = parseFloat(priceStr);
  const rating = parseFloat(ratingStr);
  const releaseDate = new Date(releaseDateStr);

  // Get the logged-in user's ID
  const userId = await getUserId(request);
  if (!userId) throw new Response("Unauthorized", { status: 401 });

  const prisma = new PrismaClient();
  try {
    await prisma.game.create({
      data: {
        title,
        description,
        price,
        rating,
        releaseDate,
        imageUrl,
        categoryId,
        userId,
      },
    });
  } finally {
    await prisma.$disconnect();
  }

  return redirect("/");
};

// Default export: the page component
export default function AddGame() {
  const { categories } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-20 px-4">
        <h1 className="font-bold text-5xl text-center mb-10">
          Add <span className="text-cyan-400">Game</span>
        </h1>
        <div className="max-w-2xl mx-auto bg-black p-8 rounded-xl shadow-lg">
          <GameForm categories={categories} />
        </div>
      </div>
    </div>
  );
}