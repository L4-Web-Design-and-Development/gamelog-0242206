import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { useState } from "react";
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

  if (isNaN(price) || isNaN(rating)) {
    throw new Response("Price and rating must be valid numbers", { status: 400 });
  }

  const releaseDate = new Date(releaseDateStr);
  if (isNaN(releaseDate.getTime())) {
    throw new Response("Invalid release date", { status: 400 });
  }

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
        <Form method="post" className="space-y-6" encType="multipart/form-data">
          <input type="hidden" name="imageUrl" value={imageUrl} />

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter Game Title"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="How was your experience?"
            />
          </div>

          <div className="mb-4">
            <ImageUploader onUpload={(url) => setImageUrl(url)} />
          </div>

          {/* Add key to conditional preview container */}
          {imageUrl && (
            <div key="preview-image" className="mb-6">
              <label className="block mb-2 text-gray-300 font-medium">
                Preview Image
              </label>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full max-h-48 rounded object-contain border border-gray-700"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium mb-2 text-gray-300"
              >
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                required
                className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 59.95"
              />
            </div>

            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium mb-2 text-gray-300"
              >
                Rating
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                required
                className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="1-5"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="releaseDate"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              Release Date
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              required
              className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option key="default-option" value="">
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-16">
            <Link
              to="/"
              className="text-red-400 border-2 border-red-400 py-3 px-6 rounded-md hover:bg-red-50/10 transition duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-cyan-600 text-white py-3 px-6 rounded-md hover:bg-cyan-500 transition duration-200"
            >
              Add Game
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
