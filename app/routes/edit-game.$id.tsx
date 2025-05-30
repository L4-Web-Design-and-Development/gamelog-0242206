import { json, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import GameForm from "~/components/GameForm";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const prisma = new PrismaClient();
  const game = await prisma.game.findUnique({
    where: { id: params.id },
  });
  const categories = await prisma.category.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  await prisma.$disconnect();
  if (!game) throw new Response("Game not found", { status: 404 });
  return json({ game, categories });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const priceStr = formData.get("price");
  const ratingStr = formData.get("rating");
  const releaseDateStr = formData.get("releaseDate");
  const categoryId = formData.get("categoryId");
  const imageUrl = formData.get("imageUrl");

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
    await prisma.game.update({
      where: { id: params.id },
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

export default function EditGame() {
  const { game, categories } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-20 px-4">
        <h1 className="font-bold text-5xl text-center mb-10">
          Edit <span className="text-cyan-400">Game</span>
        </h1>
        <div className="max-w-2xl mx-auto bg-black p-8 rounded-xl shadow-lg">
          <GameForm categories={categories} initialGame={{...game, imageUrl: game.imageUrl || '', categoryId: game.categoryId || ''}} />
        </div>
      </div>
    </div>
  );
}

// In GameFormProps, change imageUrl type to string | null
interface GameFormProps {
  categories: Category[];
  initialGame?: Game & { imageUrl: string | null };
}