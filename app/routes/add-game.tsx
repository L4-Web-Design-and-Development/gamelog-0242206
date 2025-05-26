import { PrismaClient } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import GameForm from "~/components/GameForm";
import ImageUploader from "~/components/ImageUploader";

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
  const imageUrl = formData.get("imageUrl");
  const categoryId = formData.get("categoryId");

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

  const price = parseFloat(priceStr);
  const rating = parseFloat(ratingStr);
  const releaseDate = new Date(releaseDateStr);

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
      },
    });
  } finally {
    await prisma.$disconnect();
  }

  return redirect("/");
};

export default function AddGame() {
  const { categories } = useLoaderData<typeof loader>();
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="container mx-auto py-20 px-4">
      <h1 className="font-bold text-5xl text-center mb-10">
        Add <span className="text-cyan-400">Game</span>
      </h1>
      <div className="max-w-2xl mx-auto bg-black p-8 rounded-xl shadow-lg">
        <div className="mb-6">
          <ImageUploader onUpload={setImageUrl} />
        </div>
        <GameForm categories={categories} imageUrl={imageUrl} />
      </div>
    </div>
  );
}