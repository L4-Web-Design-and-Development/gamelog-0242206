import { Form } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import GameLogButton from "./GameLogButton";

type Category = {
  id: string;
  title: string;
};

type Game = {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  releaseDate: string; // ISO string
  imageUrl: string;
  categoryId: string;
};

interface GameFormProps {
  categories: Category[];
  initialGame?: Game & { hoursPlayed?: number };
}

export default function GameForm({ categories, initialGame }: GameFormProps) {
  const [imageUrl, setImageUrl] = useState(initialGame?.imageUrl || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialGame?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For controlled fields
  const [title, setTitle] = useState(initialGame?.title || "");
  const [description, setDescription] = useState(initialGame?.description || "");
  const [price, setPrice] = useState(initialGame?.price?.toString() || "");
  const [rating, setRating] = useState(initialGame?.rating?.toString() || "");
  const [releaseDate, setReleaseDate] = useState(
    initialGame?.releaseDate ? initialGame.releaseDate.slice(0, 10) : ""
  );
  const [categoryId, setCategoryId] = useState(initialGame?.categoryId || "");
  const [hoursPlayed, setHoursPlayed] = useState(initialGame?.hoursPlayed?.toString() || "");

  // If initialGame changes (shouldn't, but for safety)
  useEffect(() => {
    if (initialGame) {
      setImageUrl(initialGame.imageUrl || "");
      setPreview(initialGame.imageUrl || null);
      setTitle(initialGame.title || "");
      setDescription(initialGame.description || "");
      setPrice(initialGame.price?.toString() || "");
      setRating(initialGame.rating?.toString() || "");
      setReleaseDate(initialGame.releaseDate ? initialGame.releaseDate.slice(0, 10) : "");
      setCategoryId(initialGame.categoryId || "");
      setHoursPlayed(initialGame.hoursPlayed?.toString() || "");
    }
  }, [initialGame]);

  async function handleImageUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setPreview(data.imageUrl);
      } else {
        setError("Upload failed. No image URL returned.");
      }
    } catch (err) {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImageUrl(""); // Clear previous uploaded URL until upload is done
    } else {
      setPreview(initialGame?.imageUrl || null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!imageUrl) {
      e.preventDefault();
      setError("Please upload an image before submitting.");
    } else {
      setError("");
    }
  }

  function handleReset() {
    setImageUrl(initialGame?.imageUrl || "");
    setError("");
    setPreview(initialGame?.imageUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTitle(initialGame?.title || "");
    setDescription(initialGame?.description || "");
    setPrice(initialGame?.price?.toString() || "");
    setRating(initialGame?.rating?.toString() || "");
    setReleaseDate(initialGame?.releaseDate ? initialGame.releaseDate.slice(0, 10) : "");
    setCategoryId(initialGame?.categoryId || "");
    setHoursPlayed(initialGame?.hoursPlayed?.toString() || "");
  }

  return (
    <div className="bg-gray-950 text-white p-6 rounded-2xl">
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="game-image-upload"
        />
        <label htmlFor="game-image-upload">
          <GameLogButton
            type="button"
            variant="secondary"
            size="sm"
            className="mr-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Image
          </GameLogButton>
        </label>
        <GameLogButton
          type="button"
          variant="primary"
          size="sm"
          onClick={handleImageUpload}
          disabled={uploading || !fileInputRef.current?.files?.[0]}
        >
          {uploading ? "Uploading..." : "Upload"}
        </GameLogButton>
      </div>
      {preview && (
        <div className="w-full h-48 bg-black border border-gray-700 rounded flex items-center justify-center overflow-hidden mb-4">
          <img
            src={preview}
            alt="Preview"
            className="object-contain max-h-full max-w-full transition-all duration-300"
          />
        </div>
      )}
      <Form
        method="post"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        onReset={handleReset}
        className="flex flex-col gap-6"
      >
        {error && <div className="mb-2 text-red-400 text-sm">{error}</div>}
        <div>
          <label htmlFor="title" className="block mb-1 text-gray-300 font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter Game Title"
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1 text-gray-300 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter Game Description"
          />
        </div>
        <div>
          <label htmlFor="price" className="block mb-1 text-gray-300 font-medium">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            required
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter Price"
          />
        </div>
        <div>
          <label htmlFor="rating" className="block mb-1 text-gray-300 font-medium">
            Rating
          </label>
          <input
            type="number"
            id="rating"
            name="rating"
            step="0.1"
            min="0"
            max="10"
            required
            value={rating}
            onChange={e => setRating(e.target.value)}
            className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter Rating (0-10)"
          />
        </div>
        <div>
          <label htmlFor="hoursPlayed" className="block mb-1 text-gray-300 font-medium">
            Total Hours Played
          </label>
          <input
            type="number"
            id="hoursPlayed"
            name="hoursPlayed"
            min="0"
            step="0.1"
            value={hoursPlayed}
            onChange={e => setHoursPlayed(e.target.value)}
            className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter total hours played"
          />
        </div>
        <div>
          <label htmlFor="releaseDate" className="block mb-1 text-gray-300 font-medium">
            Release Date
          </label>
          <input
            type="date"
            id="releaseDate"
            name="releaseDate"
            required
            value={releaseDate}
            onChange={e => setReleaseDate(e.target.value)}
            className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="categoryId" className="block mb-1 text-gray-300 font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full rounded bg-black border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Please Select</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        {/* Hidden input to submit imageUrl */}
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <div className="flex justify-end gap-3 pt-4">
          <GameLogButton
            type="button"
            variant="secondary"
            size="md"
            className="px-5"
            onClick={() => window.location.assign("/")}
          >
            Cancel
          </GameLogButton>
          <GameLogButton
            type="submit"
            variant="primary"
            size="md"
            className="px-5"
            disabled={!imageUrl}
          >
            Submit
          </GameLogButton>
        </div>
      </Form>
    </div>
  );
}